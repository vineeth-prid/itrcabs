# Deploying ITR Cabs on a Hostinger VPS

Complete, copy-paste-ready guide for Ubuntu 22.04/24.04 on a Hostinger VPS
(KVM 1 or better; 2 GB RAM recommended).

## Stack on the server

| Layer          | Choice                                     |
| -------------- | ------------------------------------------ |
| Runtime        | Node.js 20 LTS (or 22 LTS)                 |
| App            | Next.js 15 standalone server on port 3000  |
| Process manager| PM2 (auto-restart + boot persistence)      |
| Database       | PostgreSQL 16 (local on the VPS)           |
| Reverse proxy  | Nginx (ports 80/443 → 3000)                |
| TLS            | Let's Encrypt via Certbot                  |

---

## 1 · Base server setup

```bash
ssh root@YOUR_VPS_IP
apt update && apt upgrade -y
adduser itr && usermod -aG sudo itr
su - itr
```

Install Node 20 + PM2:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx
sudo npm i -g pm2
```

## 2 · PostgreSQL

```bash
sudo apt install -y postgresql
sudo -u postgres psql -c "CREATE USER itrcabs WITH PASSWORD 'CHOOSE_A_STRONG_PASSWORD';"
sudo -u postgres psql -c "CREATE DATABASE itrcabs OWNER itrcabs;"
```

## 3 · Get the code onto the VPS

Either `git clone` your repository, or upload the project folder with rsync/SFTP
(exclude `node_modules` and `.next`):

```bash
# from your Windows machine (PowerShell with scp):
scp -r itr-cabs itr@YOUR_VPS_IP:/home/itr/itr-cabs
```

## 4 · Configure environment

```bash
cd ~/itr-cabs
cp .env.example .env
nano .env
```

Set at minimum:

```env
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
DATABASE_URL="postgresql://itrcabs:CHOOSE_A_STRONG_PASSWORD@localhost:5432/itrcabs"
AUTH_SECRET=<64 random chars — `openssl rand -hex 32`>
OTP_SECRET=<64 random chars>
SEED_ADMIN_PASSWORD=<strong admin password>

# Go-live integrations
OTP_PROVIDER=msg91            # or twilio; "console" shows OTPs on screen (demo only!)
MSG91_AUTH_KEY=...
MSG91_TEMPLATE_ID=...
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...
```

## 5 · Build & seed

```bash
npm ci
npx prisma generate
npm run db:push       # creates tables
npm run db:seed       # fleet, pricing config, admin user, testimonials
npm run build
```

## 6 · Run with PM2

```bash
pm2 start npm --name itr-cabs -- start
pm2 save
pm2 startup           # run the command it prints — starts app on reboot
```

The app now serves on `http://localhost:3000`.

## 7 · Nginx reverse proxy

```bash
sudo nano /etc/nginx/sites-available/itrcabs
```

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    client_max_body_size 10m;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # Long-cache immutable Next.js assets
    location /_next/static/ {
        proxy_pass http://127.0.0.1:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/itrcabs /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

Point your domain's **A record** (in Hostinger's DNS panel) at the VPS IP.

## 8 · HTTPS

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Certbot auto-renews via systemd timer.

## 9 · Razorpay webhook

In the Razorpay dashboard → Webhooks, add:

```
https://yourdomain.com/api/payments/webhook
Events: payment.captured, payment.failed
Secret: the RAZORPAY_WEBHOOK_SECRET from your .env
```

## 10 · Updating the site later

```bash
cd ~/itr-cabs
git pull            # or re-upload files
npm ci
npx prisma generate && npm run db:push
npm run build
pm2 restart itr-cabs
```

---

## Checklist before announcing

- [ ] `OTP_PROVIDER` is **not** `console` (otherwise OTPs appear on screen)
- [ ] Razorpay keys are **live** keys and the webhook fires (test a ₹199 booking)
- [ ] Admin password changed from the demo default; log in at `/admin`
- [ ] `NEXT_PUBLIC_SITE_URL` matches your real domain (sitemap/OG links use it)
- [ ] Submit `https://yourdomain.com/sitemap.xml` in Google Search Console
- [ ] Create the Google Business Profile and link it to the site
