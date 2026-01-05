---
title: Development Standards
inclusion: always
---

# Development Standards

## Dependency Management
- Use latest stable versions of all libraries and dependencies
- Leverage Context7 MCP server to verify compatibility before adding dependencies
- Justify each new dependency with clear business or technical value
- Prefer well-maintained libraries with active communities
- Document version constraints in project files
- Remove unused dependencies regularly
- Use lock files to ensure consistent installations across environments

## Code Quality Standards
- Never create duplicate files with suffixes like `_fixed`, `_clean`, `_backup`, etc.
- Work iteratively on existing files (hooks handle commits automatically)
- Include relevant documentation links in code comments
- Follow language-specific conventions (TypeScript for CDK, Python for Lambda)
- Use meaningful variable and function names
- Keep functions small and focused on single responsibilities
- Implement proper error handling and logging

## File Management
- Maintain clean directory structures
- Use consistent naming conventions across the project
- Avoid temporary or backup files in version control
- Organize code logically by feature or domain
- Keep configuration files at appropriate levels (project vs user)
- **Place all project documentation in a `docs/` folder** to maintain clean root directory structure
- Keep only essential files (README.md, package.json, etc.) in the project root

## Documentation Approach
- Maintain single comprehensive README covering all aspects including deployment
- **Organize detailed documentation in a `docs/` folder** with clear, descriptive filenames
- Keep README.md in project root as the main entry point with links to detailed docs
- Reference official sources through MCP servers when available
- Update documentation when upgrading dependencies
- Keep documentation close to relevant code
- Use inline comments for complex business logic
- Document API endpoints and data structures
- Include setup and deployment instructions

### Documentation Structure
```
project-root/
├── README.md                    # Main project documentation (overview, quick start)
├── docs/                        # Detailed documentation folder
│   ├── SETUP_INSTRUCTIONS.md    # Detailed setup guide
│   ├── QUICKSTART.md            # Quick start guide
│   ├── PROJECT_STRUCTURE.md     # File organization
│   ├── DEPLOYMENT.md            # Deployment instructions
│   ├── API.md                   # API documentation
│   └── TROUBLESHOOTING.md       # Common issues and solutions
└── [project files]
```

## Version Control Integration
- Commit frequently with meaningful messages
- Use feature branches for development
- Keep main branch deployable at all times
- Tag releases appropriately
- Use .gitignore to exclude generated files and secrets

## Quality Assurance
- Write tests for new functionality
- Run tests before committing changes
- Use linting and formatting tools consistently
- Perform code reviews for all changes
- Monitor code coverage and maintain high standards