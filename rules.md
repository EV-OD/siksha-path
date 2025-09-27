## Guidelines

### 1. Project Structure
- Use **feature-based modules**: each feature has its own module folder with `controller`, `service`, `dto`, and `entity` (if database-related).  
- Include a `common/` folder for reusable utilities, guards, interceptors, filters, pipes, and constants.  
- `config/` folder for environment variables and app configuration.  
- `main.ts` should be clean and only handle app bootstrap and global middleware setup.  

### 2. Modularity
- Each module should be **self-contained** and able to be imported independently.  
- Services should encapsulate **business logic** only.  
- Controllers should **only handle request/response and validation**, no business logic.  
- DTOs define the **shape of incoming/outgoing data**, using class-validator for validation.  

### 3. Dependency Management
- Use NestJS **Dependency Injection** for all services, repositories, and providers.  
- Avoid tight coupling between modules; interact via interfaces or shared modules when needed.  

### 4. Database & Entities (if applicable)
- Use **ORM or database layer** in a separate folder or module.  
- Define **entities clearly** with proper relationships.  
- Keep database operations in services/repositories, not controllers.  

### 5. Standard Practices
- Use **RESTful naming conventions** for controllers and routes.  
- Return **consistent HTTP responses** with proper status codes.  
- Handle errors using **global exception filters**.  
- Logging and configuration should be centralized.  

### 6. Extensibility
- Code should be easy to extend: adding a new feature means **creating a new module** without modifying existing modules.  
- Encourage **reusable helpers** in `common/`.  
- Use **interfaces and abstract classes** for contracts between modules.  

### 7. Output Style
- Provide **folder structure** + **example code snippets** for controllers, services, and DTOs.  
- Include comments explaining **why modules/services are separated**, and **how DI is used**.  
- Demonstrate **best-practice patterns** like Providers, Guards, and Interceptors.  
