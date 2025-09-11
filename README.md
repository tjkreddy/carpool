![Build](https://github.com/tjkreddy/carpool/actions/workflows/ci.yml/badge.svg)
![Code Coverage](https://img.shields.io/codecov/c/github/tjkreddy/carpool)
![Last Commit](https://img.shields.io/github/last-commit/tjkreddy/carpool)
![License](https://img.shields.io/github/license/tjkreddy/carpool)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)

# Campus Carpool
Campus Carpool is a web application designed to help students at the same college share rides. It provides a platform for students to offer rides, find rides, and communicate with each other to coordinate carpooling.
## Features
- **User Authentication**: Secure registration and login for students with valid college email addresses.
- **Ride Offers**: Drivers can offer rides, specifying details like route, departure time, available seats, and cost per seat.
- **Ride Requests**: Students can request rides, and drivers can accept or decline them.
- **Ride Search**: A comprehensive search feature to find rides based on location, date, cost, and other preferences.
- **Messaging**: A built-in messaging system for users to communicate and coordinate ride details.
- **User Profiles**: User profiles with ratings, ride history, and personal information.
- **Ratings and Reviews**: A rating system to build trust and accountability within the community.
## Technology Stack
This project is built with:
- **Vite**: A fast build tool for modern web projects.
- **React**: A JavaScript library for building user interfaces.
- **TypeScript**: A typed superset of JavaScript that compiles to plain JavaScript.
- **Tailwind CSS**: A utility-first CSS framework for rapid UI development.
- **shadcn/ui**: A collection of re-usable components built with Radix UI and Tailwind CSS.
- **React Router**: For client-side routing.
- **Zustand**: A small, fast, and scalable state-management solution.
- **TanStack Query**: For data fetching, caching, and state management.
## Getting Started
To get a local copy up and running, follow these simple steps.
### Prerequisites
You need to have `pnpm` installed. If you don't have it, you can install it with:
```sh
npm install -g pnpm
```
### Installation
1. Clone the repo:
   ```sh
   git clone https://github.com/your-username/campus-carpool.git
   ```
2. Navigate to the project directory:
   ```sh
   cd shadcn-ui
   ```
3. Install dependencies:
   ```sh
   pnpm install
   ```

### Running the Application

To start the development server, run:

```sh
pnpm run dev
```

This will start the application in development mode. Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

### Building for Production

To create a production build, run:

```sh
pnpm run build
```

This will create a `dist` directory with the optimized production build of the application.

### Running Tests

This project uses vitest for testing. To run the tests, use:

```sh
pnpm test
```

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.
