# Contributing to Campus Carpool

We love your input! We want to make contributing to Campus Carpool as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

## Pull Requests

Pull requests are the best way to propose changes to the codebase. We actively welcome your pull requests:

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Issue that pull request!

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- pnpm (v8 or higher)
- Git

### Setup

1. **Fork the repository**
   ```bash
   # Click the 'Fork' button on GitHub
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/your-username/carpool.git
   cd carpool
   ```

3. **Install dependencies**
   ```bash
   cd shadcn-ui
   pnpm install
   ```

4. **Set up environment variables**
   ```bash
   # Copy the example environment file
   cp .env.example .env.local
   # Fill in your environment variables
   ```

5. **Start the development server**
   ```bash
   pnpm run dev
   ```

## Code Style

### TypeScript
- Use TypeScript for all new files
- Follow the existing code style and patterns
- Use meaningful variable and function names
- Add proper type annotations

### React Components
- Use functional components with hooks
- Follow the existing component structure
- Use the shadcn/ui components when possible
- Keep components focused and reusable

### CSS/Styling
- Use Tailwind CSS classes
- Follow the existing design system
- Keep styles maintainable and consistent

## Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` new features
- `fix:` bug fixes
- `docs:` documentation changes
- `style:` formatting, missing semicolons, etc.
- `refactor:` code changes that neither fix bugs nor add features
- `test:` adding or updating tests
- `chore:` updating build tasks, package manager configs, etc.

### Examples
```bash
feat: add ride sharing functionality
fix: resolve authentication bug
docs: update README with new setup instructions
style: format code with prettier
refactor: extract common utility functions
test: add unit tests for ride booking
chore: update dependencies
```

## Testing

- Write tests for new features and bug fixes
- Run the test suite before submitting PRs: `pnpm test`
- Ensure all tests pass
- Aim for good test coverage

## Reporting Bugs

We use GitHub issues to track public bugs. Report a bug by [opening a new issue](https://github.com/tjkreddy/carpool/issues/new).

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

## Feature Requests

We love feature requests! Before submitting one:

1. Check if the feature already exists
2. Search existing issues to see if it's already been requested
3. If not, [create a new issue](https://github.com/tjkreddy/carpool/issues/new) with:
   - Clear description of the feature
   - Use case and motivation
   - Possible implementation approach (if you have ideas)

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Questions?

Feel free to contact the maintainers if you have any questions. You can reach us through:

- GitHub Issues
- GitHub Discussions
- Email (see profile for contact info)

## Recognition

Contributors will be recognized in our README and release notes. We appreciate all contributions, big and small!

Thank you for contributing to Campus Carpool! 🚗
