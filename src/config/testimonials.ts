export interface Testimonial {
  name: string;
  role: string;
  location: string;
  rating: number;
  text: string;
  trip: string;
}

export const testimonials: Testimonial[] = [
  {
    name: "Anjali Menon",
    role: "HR Manager, Infopark",
    location: "Kakkanad",
    rating: 5,
    trip: "Employee transportation",
    text: "We moved our night-shift employee transport to ITR Cabs two years ago. Zero missed pickups since. The GPS visibility and the monthly trip-wise invoice make my audits painless.",
  },
  {
    name: "Rahul Nair",
    role: "Frequent flyer",
    location: "Ernakulam",
    rating: 5,
    trip: "Airport transfer",
    text: "My flight landed 40 minutes late at 1 am. The driver was already at arrivals tracking it, name board up. That's the difference between a cab and a service.",
  },
  {
    name: "Sarah Thomas",
    role: "Family traveller",
    location: "Kochi",
    rating: 5,
    trip: "Munnar 3-day package",
    text: "Our driver knew every viewpoint before the crowds arrived and every clean restaurant on the Munnar route. The Innova was spotless all three days. My parents still talk about the trip.",
  },
  {
    name: "Vishnu Prasad",
    role: "Wedding planner",
    location: "Thrissur",
    rating: 5,
    trip: "Wedding fleet",
    text: "Coordinated 4 vehicles across two venues without me chasing anyone. The Urbania for the groom's family was a hit — guests thought we'd hired something imported.",
  },
  {
    name: "Deepa Krishnan",
    role: "Operations Head",
    location: "SmartCity Kochi",
    rating: 5,
    trip: "Corporate account",
    text: "Transparent billing, a coordinator who answers on the second ring, and drivers who are always in formals for client pickups. Our leadership team uses no one else now.",
  },
  {
    name: "James Kurian",
    role: "NRI visitor",
    location: "Kochi ⇄ Kumarakom",
    rating: 5,
    trip: "Luxury SUV rental",
    text: "Booked the luxury SUV for two weeks visiting family across Kerala. Immaculate car, superb driver, and the ₹199 booking with OTP verification felt properly modern.",
  },
  {
    name: "Meera Pillai",
    role: "Solo traveller",
    location: "Alleppey",
    rating: 5,
    trip: "Backwater day trip",
    text: "As a woman travelling alone, the verified driver details and live trip tracking gave my family real peace of mind. Professional from first call to drop-off.",
  },
  {
    name: "Arun George",
    role: "Team lead",
    location: "Kakkanad",
    rating: 4,
    trip: "Office day-out",
    text: "17-seater tempo for our team outing to Vagamon. Push-back seats, great sound system, patient driver on the hairpins. Booking the whole thing took five minutes online.",
  },
];
