# Bitcoin Node Manager Implementation Patterns

This document provides a comprehensive overview of the implementation patterns that will be used for the Bitcoin Node Manager application. Each pattern is documented in a separate file for clarity and ease of reference, but this summary provides enough detail to guide AI-assisted development.

## Frontend Patterns

### 1. Basic Component Patterns - `.augment/patterns/BasicComponentPatterns.md`

These patterns establish the foundation for all UI components in the application:

- **Component Structure**: All components follow a functional component approach with TypeScript interfaces for props
- **Prop Definitions**: Props include comprehensive JSDoc comments for better documentation and AI assistance
- **Styling Approach**: Components use TailwindCSS utility classes with consistent spacing and color variables
- **Accessibility**: All components include proper ARIA attributes and keyboard navigation support
- **Variants**: Components support multiple variants (primary, secondary, etc.) through prop configuration
- **Loading States**: Interactive components include built-in loading state handling
- **Error States**: Form components include error state handling with consistent visual feedback
- **Dark Mode**: All components support dark mode through TailwindCSS dark variants

Example component structure:
```tsx
interface ButtonProps {
  /** Text to display inside the button */
  children: React.ReactNode;
  /** Function to call when button is clicked */
  onClick?: () => void;
  /** Whether the button is in a loading state */
  isLoading?: boolean;
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  // Additional props...
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  isLoading = false,
  variant = 'primary',
  // Additional props...
}) => {
  // Component implementation
};
```

### 2. Form Handling Patterns - `.augment/patterns/FormPatterns.md`

These patterns establish how forms are implemented throughout the application:

- **Form Library**: React Hook Form for form state management with Zod for validation
- **Validation Approach**: Schema-based validation with typed error messages
- **Error Display**: Inline error messages below form fields
- **Submission Handling**: Consistent pattern for handling form submission, including loading states
- **Field Grouping**: Logical grouping of related form fields
- **Conditional Fields**: Pattern for showing/hiding fields based on other field values
- **Form Layout**: Consistent spacing and alignment for form elements
- **Accessibility**: Proper labeling and error announcement for screen readers

Example form pattern:
```tsx
// Form schema definition
const loginFormSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(8, "Password must be at least 8 characters")
});

// Type inference from schema
type LoginFormValues = z.infer<typeof loginFormSchema>;

// Form component
export const LoginForm: React.FC<{ onSubmit: (data: LoginFormValues) => Promise<void> }> = ({ onSubmit }) => {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      username: "",
      password: ""
    }
  });
  
  // Form implementation
};
```

### 3. Data Fetching Patterns - `.augment/patterns/DataFetchingPatterns.md`

These patterns establish how data is fetched and managed throughout the application:

- **Query Library**: React Query for data fetching, caching, and synchronization
- **Query Structure**: Consistent pattern for defining queries with proper types
- **Loading States**: Standardized approach to handling loading states in UI
- **Error Handling**: Consistent error handling and display
- **Caching Strategy**: Appropriate cache times based on data volatility
- **Refetch Policies**: When and how to refetch data (on window focus, polling, etc.)
- **Pagination**: Standard approach to paginated data
- **Mutations**: Consistent pattern for data mutations with optimistic updates
- **Query Invalidation**: Rules for when to invalidate and refetch queries

Example data fetching pattern:
```tsx
// Query hook definition
export function useNodeInfo() {
  return useQuery<NodeInfo>(
    ['node', 'info'],
    async () => {
      const response = await api.get('/api/node/info');
      return response.data;
    },
    {
      refetchInterval: 30000, // Refetch every 30 seconds
      staleTime: 10000, // Consider data stale after 10 seconds
      retry: 3, // Retry failed requests 3 times
      onError: (error) => {
        // Error handling logic
      }
    }
  );
}

// Component usage
const NodeInfoCard: React.FC = () => {
  const { data, isLoading, error } = useNodeInfo();
  
  if (isLoading) return <LoadingCard />;
  if (error) return <ErrorCard error={error} />;
  
  // Render component with data
};
```

### 4. Layout Patterns - `.augment/patterns/LayoutPatterns.md`

These patterns establish the structure and organization of pages and components:

- **Page Layout**: Consistent page structure with header, main content, and footer
- **Responsive Breakpoints**: Standard breakpoints for responsive design (sm, md, lg, xl, 2xl)
- **Grid System**: Consistent grid layout using TailwindCSS grid utilities
- **Spacing System**: Standardized spacing scale based on 4px increments
- **Component Containers**: Consistent container widths and padding
- **Sidebar Navigation**: Standard sidebar implementation with mobile responsiveness
- **Z-Index Management**: Consistent z-index scale for layered elements
- **Page Transitions**: Smooth transitions between pages

Example layout pattern:
```tsx
export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="lg:pl-64">
        <Header />
        <main className="py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
};
```

### 5. Authentication Patterns - `.augment/patterns/AuthPatterns.md`

These patterns establish how authentication is handled throughout the application:

- **Auth Context**: React Context for storing and accessing authentication state
- **Protected Routes**: HOC or component for protecting routes that require authentication
- **Login Flow**: Standard login process with form validation and error handling
- **Token Storage**: Secure storage of JWT tokens
- **Token Refresh**: Automatic refresh of expired tokens
- **Logout Handling**: Consistent logout process with cleanup
- **Auth State Persistence**: Maintaining auth state across page refreshes
- **Role-Based Access Control**: Restricting UI elements based on user roles

Example authentication pattern:
```tsx
// Auth context definition
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Auth provider implementation
};

// Protected route component
export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);
  
  if (loading) return <LoadingScreen />;
  if (!user) return null;
  
  return <>{children}</>;
};
```

### 6. State Management Patterns - `.augment/patterns/StateManagementPatterns.md`

These patterns establish how application state is managed:

- **Local vs. Global State**: Guidelines for when to use local component state vs. global state
- **Context Structure**: Organization of context providers for global state
- **State Updates**: Consistent patterns for updating state
- **Derived State**: Computing derived state from raw state
- **State Persistence**: Persisting state across page refreshes when needed
- **State Synchronization**: Keeping state in sync with server data
- **Performance Optimization**: Preventing unnecessary re-renders
- **State Initialization**: Patterns for initializing state from various sources

Example state management pattern:
```tsx
// Theme context example
export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    // Initialize from localStorage or system preference
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'light' || savedTheme === 'dark') {
        return savedTheme;
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });
  
  // Theme provider implementation
};
```

### 7. Chart and Visualization Patterns - `.augment/patterns/ChartPatterns.md`

These patterns establish how data visualizations are implemented:

- **Chart Library**: Chart.js with react-chartjs-2 for React integration
- **Chart Types**: Guidelines for which chart types to use for different data
- **Color Schemes**: Consistent color palettes for different chart elements
- **Responsiveness**: Making charts responsive to container size
- **Tooltips**: Standardized tooltip formatting
- **Legends**: Consistent legend placement and styling
- **Accessibility**: Making charts accessible with appropriate ARIA attributes
- **Loading and Error States**: Handling loading and error states in visualizations
- **Animation**: Consistent animation settings

Example chart pattern:
```tsx
export const MempoolChart: React.FC<{ data: MempoolData[] }> = ({ data }) => {
  const chartData = {
    labels: data.map(d => format(new Date(d.timestamp), 'HH:mm')),
    datasets: [
      {
        label: 'Transaction Count',
        data: data.map(d => d.count),
        borderColor: '#3498db',
        backgroundColor: 'rgba(52, 152, 219, 0.2)',
        fill: true,
      }
    ]
  };
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    // Additional options...
  };
  
  return (
    <div className="h-64">
      <Line data={chartData} options={options} />
    </div>
  );
};
```

### 8. Table Patterns - `.augment/patterns/TablePatterns.md`

These patterns establish how data tables are implemented:

- **Table Library**: React Table (TanStack Table) for table functionality
- **Column Definitions**: Consistent pattern for defining table columns
- **Sorting**: Implementation of sortable columns
- **Filtering**: Standard approach to column filtering
- **Pagination**: Consistent pagination implementation
- **Row Selection**: Patterns for selecting rows
- **Expandable Rows**: Implementation of expandable row details
- **Responsive Tables**: Making tables work on mobile devices
- **Loading States**: Skeleton loaders for tables
- **Empty States**: Consistent empty state display

Example table pattern:
```tsx
export const PeersTable: React.FC<{ data: Peer[] }> = ({ data }) => {
  const columns = useMemo(() => [
    {
      Header: 'Address',
      accessor: 'addr',
    },
    {
      Header: 'Country',
      accessor: 'country',
      Cell: ({ value }) => (
        <div className="flex items-center">
          <CountryFlag country={value} className="mr-2" />
          {value}
        </div>
      ),
    },
    // Additional columns...
  ], []);
  
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable(
    {
      columns,
      data,
    },
    useSortBy,
    usePagination
  );
  
  // Table implementation
};
```

### 9. WebSocket Patterns - `.augment/patterns/WebSocketPatterns.md`

These patterns establish how real-time communication is implemented:

- **Socket Library**: Socket.io client for WebSocket communication
- **Connection Management**: Establishing and maintaining socket connections
- **Event Handling**: Consistent pattern for handling socket events
- **Reconnection Strategy**: Handling connection drops and reconnections
- **Error Handling**: Managing socket errors
- **Authentication**: Authenticating WebSocket connections
- **State Synchronization**: Keeping UI state in sync with socket events
- **Performance Considerations**: Optimizing socket usage for performance

Example WebSocket pattern:
```tsx
export const useSocketConnection = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const { user } = useAuth();
  
  useEffect(() => {
    if (!user) return;
    
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
      auth: {
        token: user.token,
      },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    
    newSocket.on('connect', () => {
      setConnected(true);
    });
    
    newSocket.on('disconnect', () => {
      setConnected(false);
    });
    
    setSocket(newSocket);
    
    return () => {
      newSocket.disconnect();
    };
  }, [user]);
  
  return { socket, connected };
};
```

## Backend Patterns

### 10. API Endpoint Patterns - `.augment/patterns/APIPatterns.md`

These patterns establish how API endpoints are structured and implemented:

- **Controller Structure**: Organization of API controllers by resource
- **Route Naming**: Consistent RESTful route naming conventions
- **Request Validation**: Validating incoming requests with Zod
- **Response Formatting**: Standardized response structure
- **Error Handling**: Consistent error response format
- **Pagination**: Standard approach to paginated responses
- **Filtering and Sorting**: Handling query parameters for filtering and sorting
- **Authentication**: Securing endpoints with authentication middleware
- **Rate Limiting**: Protecting endpoints from abuse

Example API endpoint pattern:
```typescript
// Controller definition
export class PeerController {
  // Get all peers
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const peers = await peerService.getAllPeers();
      return res.json({
        success: true,
        data: peers,
      });
    } catch (error) {
      next(error);
    }
  }
  
  // Ban a peer
  static async banPeer(req: Request, res: Response, next: NextFunction) {
    try {
      const { address } = req.params;
      const { reason, banTime } = req.body;
      
      const result = await peerService.banPeer(address, reason, banTime);
      
      return res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
  
  // Additional methods...
}

// Route definition
const router = express.Router();

router.get('/peers', authenticate, PeerController.getAll);
router.post('/peers/:address/ban', authenticate, validateBanRequest, PeerController.banPeer);

// Additional routes...
```

### 11. Database Patterns - `.augment/patterns/DatabasePatterns.md`

These patterns establish how database operations are implemented:

- **ORM Usage**: Prisma ORM for database interactions
- **Schema Design**: Guidelines for designing database schemas
- **Query Optimization**: Techniques for optimizing database queries
- **Transaction Handling**: Managing database transactions
- **Migration Strategy**: Approach to database migrations
- **Seeding**: Populating the database with initial data
- **Error Handling**: Managing database errors
- **Connection Pooling**: Optimizing database connections
- **Soft Deletes**: Implementing soft delete functionality

Example database pattern:
```typescript
// Prisma schema example
// schema.prisma
model User {
  id        String   @id @default(uuid())
  username  String   @unique
  password  String
  role      Role     @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// Database service example
export class UserService {
  static async findByUsername(username: string) {
    return prisma.user.findUnique({
      where: { username },
    });
  }
  
  static async create(data: { username: string; password: string }) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    return prisma.user.create({
      data: {
        username: data.username,
        password: hashedPassword,
      },
    });
  }
  
  // Additional methods...
}
```

### 12. Authentication Middleware Patterns - `.augment/patterns/AuthMiddlewarePatterns.md`

These patterns establish how authentication is implemented on the server:

- **JWT Verification**: Validating JWT tokens
- **Role-Based Access**: Restricting access based on user roles
- **Token Refresh**: Handling token refresh requests
- **Security Headers**: Implementing security-related HTTP headers
- **CSRF Protection**: Preventing cross-site request forgery
- **Rate Limiting**: Limiting authentication attempts
- **Session Management**: Handling user sessions
- **Logout Handling**: Properly invalidating sessions on logout

Example authentication middleware pattern:
```typescript
// JWT verification middleware
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
      req.user = decoded;
      next();
    } catch (error) {
      throw new UnauthorizedError('Invalid token');
    }
  } catch (error) {
    next(error);
  }
};

// Role-based access middleware
export const authorize = (roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('User not authenticated'));
    }
    
    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError('Insufficient permissions'));
    }
    
    next();
  };
};
```

### 13. Bitcoin RPC Patterns - `.augment/patterns/BitcoinRPCPatterns.md`

These patterns establish how Bitcoin Core RPC communication is implemented:

- **RPC Client**: Using the bitcoin-core npm package for reliable RPC communication
- **Connection Management**: Handling connection setup, pooling, and error recovery
- **Error Handling**: Standardized approach to handling RPC errors with specific error types
- **Caching Strategy**: Implementing tiered caching based on data volatility
- **Retry Logic**: Automatic retry for transient failures with exponential backoff
- **Batch Requests**: Optimizing performance with batched RPC calls
- **Timeout Handling**: Proper handling of request timeouts
- **Logging**: Structured logging of RPC interactions for debugging
- **Mock Responses**: Test doubles for development without a Bitcoin node

Example Bitcoin RPC pattern:
```typescript
// Bitcoin RPC service
export class BitcoinService {
  private client: Client;
  private cache: NodeCache;
  
  constructor() {
    // Initialize RPC client
    this.client = new Client({
      network: process.env.BITCOIN_NETWORK || 'mainnet',
      username: process.env.BITCOIN_RPC_USER,
      password: process.env.BITCOIN_RPC_PASSWORD,
      host: process.env.BITCOIN_RPC_HOST || '127.0.0.1',
      port: parseInt(process.env.BITCOIN_RPC_PORT || '8332'),
      timeout: 30000
    });
    
    // Initialize cache
    this.cache = new NodeCache({ stdTTL: 60 }); // Default 60s TTL
  }
  
  // Get node info with caching
  async getNodeInfo() {
    const cacheKey = 'node_info';
    const cachedData = this.cache.get(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }
    
    try {
      const [networkInfo, blockchainInfo, mempoolInfo] = await Promise.all([
        this.client.getNetworkInfo(),
        this.client.getBlockchainInfo(),
        this.client.getMempoolInfo()
      ]);
      
      const result = {
        version: networkInfo.version,
        protocolVersion: networkInfo.protocolversion,
        blocks: blockchainInfo.blocks,
        connections: networkInfo.connections,
        difficulty: blockchainInfo.difficulty,
        mempool: {
          size: mempoolInfo.size,
          bytes: mempoolInfo.bytes,
          usage: mempoolInfo.usage
        }
      };
      
      // Cache with appropriate TTL
      this.cache.set(cacheKey, result, 30); // 30s TTL for node info
      
      return result;
    } catch (error) {
      throw this.handleRpcError(error);
    }
  }
  
  // Handle RPC errors
  private handleRpcError(error: any) {
    if (error.code) {
      switch (error.code) {
        case -28:
          return new BitcoinNodeStartingError('Bitcoin Core is starting up');
        case -8:
          return new BitcoinInvalidParameterError(error.message);
        default:
          return new BitcoinRpcError(`RPC error (${error.code}): ${error.message}`);
      }
    }
    
    if (error.code === 'ECONNREFUSED') {
      return new BitcoinConnectionError('Could not connect to Bitcoin Core');
    }
    
    return error;
  }
}
```

### 14. WebSocket Server Patterns - `.augment/patterns/WebSocketServerPatterns.md`

These patterns establish how WebSocket communication is implemented on the server:

- **Socket.io Setup**: Configuring Socket.io server with Express
- **Namespace Organization**: Structuring socket namespaces by feature
- **Event Naming**: Consistent event naming conventions
- **Authentication**: Securing WebSocket connections with JWT
- **Room Management**: Organizing clients into rooms for targeted broadcasts
- **Broadcast Strategies**: Patterns for broadcasting events to clients
- **Error Handling**: Managing and communicating socket errors
- **Connection Lifecycle**: Handling connect, disconnect, and reconnect events
- **Rate Limiting**: Preventing abuse of socket connections
- **State Synchronization**: Keeping server state in sync with client events

Example WebSocket server pattern:
```typescript
// Socket.io server setup
export class SocketService {
  private io: Server;
  
  constructor(server: HttpServer) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL,
        methods: ['GET', 'POST'],
        credentials: true
      }
    });
    
    // Middleware for authentication
    this.io.use(this.authenticateSocket);
    
    // Initialize socket handlers
    this.initializeHandlers();
  }
  
  // Socket authentication middleware
  private authenticateSocket(socket: Socket, next: (err?: Error) => void) {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error'));
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
      socket.data.user = decoded;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  }
  
  // Initialize event handlers
  private initializeHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`User connected: ${socket.id}`);
      
      // Join user to appropriate rooms
      socket.join(`user:${socket.data.user.id}`);
      
      // Handle blockchain events
      socket.on('subscribe:blocks', () => {
        socket.join('blocks');
      });
      
      socket.on('unsubscribe:blocks', () => {
        socket.leave('blocks');
      });
      
      // Handle disconnect
      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
      });
    });
  }
  
  // Broadcast new block to subscribed clients
  public broadcastNewBlock(block: Block) {
    this.io.to('blocks').emit('new:block', block);
  }
}
```

### 15. Error Handling Patterns - `.augment/patterns/ErrorHandlingPatterns.md`

These patterns establish how errors are handled throughout the application:

- **Error Hierarchy**: Structured hierarchy of custom error classes
- **Error Middleware**: Express middleware for consistent error responses
- **Status Codes**: Mapping error types to appropriate HTTP status codes
- **Error Logging**: Structured logging of errors for monitoring
- **Validation Errors**: Handling and formatting validation errors
- **Operational vs. Programming Errors**: Distinguishing between different error types
- **Client-Friendly Messages**: Providing user-friendly error messages
- **Error Serialization**: Consistent format for error responses
- **Async Error Handling**: Properly catching and handling async errors

Example error handling pattern:
```typescript
// Base error class
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

// Specific error types
export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed', public errors?: Record<string, string[]>) {
    super(message, 400);
  }
}

// Error handling middleware
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Default error values
  let statusCode = 500;
  let message = 'Internal server error';
  let errors: Record<string, string[]> | undefined;
  let isOperational = false;
  
  // Handle known error types
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    isOperational = err.isOperational;
    
    if (err instanceof ValidationError && err.errors) {
      errors = err.errors;
    }
  } else if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation failed';
    isOperational = true;
    errors = formatZodError(err);
  }
  
  // Log error
  if (!isOperational) {
    console.error('Unhandled error:', err);
  }
  
  // Send response
  res.status(statusCode).json({
    success: false,
    message,
    errors,
    ...(process.env.NODE_ENV === 'development' && !isOperational ? { stack: err.stack } : {})
  });
};
```

### 16. Validation Patterns - `.augment/patterns/ValidationPatterns.md`

These patterns establish how input validation is implemented:

- **Schema Definition**: Using Zod for type-safe schema validation
- **Validation Middleware**: Express middleware for request validation
- **Error Formatting**: Consistent formatting of validation errors
- **Schema Reuse**: Sharing schemas between frontend and backend
- **Custom Validators**: Implementing domain-specific validation rules
- **Sanitization**: Cleaning and normalizing input data
- **Validation Contexts**: Different validation rules for different contexts
- **Partial Validation**: Validating partial updates vs. full objects

Example validation pattern:
```typescript
// Schema definition
export const createUserSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username cannot exceed 50 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  role: z.enum(['ADMIN', 'USER']).optional()
});

// Type inference
export type CreateUserInput = z.infer<typeof createUserSchema>;

// Validation middleware
export const validateRequest = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(new ValidationError('Validation failed', formatZodError(error)));
      } else {
        next(error);
      }
    }
  };
};

// Usage in routes
router.post(
  '/users',
  validateRequest(z.object({ body: createUserSchema })),
  UserController.createUser
);
```

## Testing Patterns

### 17. Unit Testing Patterns - `.augment/patterns/UnitTestingPatterns.md`

These patterns establish how unit tests are implemented:

- **Test Framework**: Jest for test running and assertions
- **Component Testing**: React Testing Library for component tests
- **Test Structure**: Consistent organization with describe/it blocks
- **Mocking Strategy**: Approach to mocking dependencies
- **Test Data**: Creating and managing test fixtures
- **Assertion Style**: Consistent assertion patterns
- **Coverage Goals**: Target code coverage metrics
- **Test Naming**: Descriptive test naming conventions
- **Setup and Teardown**: Managing test environment

Example unit testing pattern:
```typescript
// Service unit test
describe('UserService', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  
  describe('findByUsername', () => {
    it('should return user when found', async () => {
      // Arrange
      const mockUser = { id: '1', username: 'testuser', password: 'hashedpw' };
      prisma.user.findUnique.mockResolvedValue(mockUser);
      
      // Act
      const result = await UserService.findByUsername('testuser');
      
      // Assert
      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { username: 'testuser' }
      });
    });
    
    it('should return null when user not found', async () => {
      // Arrange
      prisma.user.findUnique.mockResolvedValue(null);
      
      // Act
      const result = await UserService.findByUsername('nonexistent');
      
      // Assert
      expect(result).toBeNull();
    });
  });
  
  // Additional tests...
});

// Component unit test
describe('LoginForm', () => {
  it('should render login form', () => {
    // Arrange
    const handleSubmit = jest.fn();
    
    // Act
    render(<LoginForm onSubmit={handleSubmit} />);
    
    // Assert
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });
  
  it('should show validation errors', async () => {
    // Arrange
    const handleSubmit = jest.fn();
    
    // Act
    render(<LoginForm onSubmit={handleSubmit} />);
    
    // Submit without filling fields
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    // Assert
    expect(await screen.findByText(/username is required/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });
  
  // Additional tests...
});
```

### 18. Integration Testing Patterns - `.augment/patterns/IntegrationTestingPatterns.md`

These patterns establish how integration tests are implemented:

- **API Testing**: Testing API endpoints end-to-end
- **Database Testing**: Testing database interactions
- **Test Environment**: Setting up isolated test environments
- **Seeding Strategy**: Populating test databases
- **Cleanup**: Cleaning up test data between tests
- **Authentication**: Handling authentication in tests
- **Request Helpers**: Utilities for making API requests in tests
- **Assertion Patterns**: Verifying API responses and database state

Example integration testing pattern:
```typescript
// API integration test
describe('User API', () => {
  beforeAll(async () => {
    // Set up test database
    await prisma.$connect();
    await prisma.$executeRaw`TRUNCATE TABLE "User" CASCADE`;
  });
  
  afterAll(async () => {
    await prisma.$disconnect();
  });
  
  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      // Arrange
      const userData = {
        username: 'testuser',
        password: 'Password123'
      };
      
      // Act
      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(201);
      
      // Assert
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('username', 'testuser');
      expect(response.body.data).not.toHaveProperty('password');
      
      // Verify database state
      const user = await prisma.user.findUnique({
        where: { username: 'testuser' }
      });
      
      expect(user).not.toBeNull();
      expect(user?.username).toBe('testuser');
    });
    
    it('should return validation error for invalid data', async () => {
      // Arrange
      const userData = {
        username: 'te',
        password: 'weak'
      };
      
      // Act
      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(400);
      
      // Assert
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Validation failed');
      expect(response.body.errors).toHaveProperty('username');
      expect(response.body.errors).toHaveProperty('password');
    });
    
    // Additional tests...
  });
  
  // Additional endpoint tests...
});
```

### 19. Mock Patterns - `.augment/patterns/MockPatterns.md`

These patterns establish how mocking is implemented in tests:

- **Dependency Mocking**: Using Jest mock functions to replace external dependencies
- **Service Mocking**: Creating test doubles for service layers with predictable behavior
- **API Mocking**: Using MSW (Mock Service Worker) to intercept and mock HTTP requests
- **Mock Implementation**: Providing realistic mock behavior that mimics production systems
- **Mock Verification**: Verifying that mocks were called with expected parameters
- **Partial Mocking**: Mocking specific methods while keeping others intact
- **Mock Data Generation**: Using factories (like faker.js) to generate realistic test data
- **Bitcoin RPC Mocking**: Simulating Bitcoin Core RPC responses for testing without a node
- **WebSocket Mocking**: Creating mock Socket.io servers for testing real-time features

Example mock pattern:
```typescript
// Mock Bitcoin RPC client for testing
export class MockBitcoinClient {
  // Mock implementation of getNetworkInfo
  async getNetworkInfo() {
    return {
      version: 280100,
      subversion: '/Satoshi:28.1.0/',
      protocolversion: 70016,
      localservices: '000000000000040d',
      localservicesnames: ['NETWORK', 'BLOOM', 'WITNESS', 'NETWORK_LIMITED', 'COMPACT_FILTERS'],
      localrelay: true,
      timeoffset: 0,
      networkactive: true,
      connections: 8,
      connections_in: 0,
      connections_out: 8,
      networks: [
        /* Network details */
      ],
      relayfee: 0.00001000,
      incrementalfee: 0.00001000,
      localaddresses: [],
      warnings: ''
    };
  }
  
  // Mock implementation of getBlockchainInfo
  async getBlockchainInfo() {
    return {
      chain: 'main',
      blocks: 800000,
      headers: 800000,
      bestblockhash: '000000000000000000000000000000000000000000000000000000000000000',
      difficulty: 53911173001054.59,
      mediantime: 1677721296,
      verificationprogress: 1,
      initialblockdownload: false,
      chainwork: '00000000000000000000000000000000000000000000000000000000000000'
    };
  }
  
  // Mock implementation of getPeerInfo
  async getPeerInfo() {
    return [
      {
        id: 1,
        addr: '203.0.113.1:8333',
        addrbind: '192.168.1.2:8333',
        addrlocal: '192.168.1.2:8333',
        network: 'ipv4',
        services: '000000000000040d',
        servicesnames: ['NETWORK', 'BLOOM', 'WITNESS', 'NETWORK_LIMITED', 'COMPACT_FILTERS'],
        relaytxes: true,
        lastsend: 1677721296,
        lastrecv: 1677721290,
        bytessent: 1837492,
        bytesrecv: 90387431,
        conntime: 1677700000,
        timeoffset: 0,
        pingtime: 0.098371,
        minping: 0.097899,
        version: 70016,
        subver: '/Satoshi:28.1.0/',
        inbound: false,
        startingheight: 799990,
        banscore: 0,
        synced_headers: 800000,
        synced_blocks: 800000,
        inflight: [],
        whitelisted: false,
        permissions: [],
        minfeefilter: 0.00001000,
        bytessent_per_msg: {
          /* Message details */
        },
        bytesrecv_per_msg: {
          /* Message details */
        }
      }
      // Additional peers...
    ];
  }
  
  // Additional mock methods as needed
}

// Usage in tests
jest.mock('../../services/bitcoin.service', () => {
  return {
    BitcoinService: jest.fn().mockImplementation(() => {
      return {
        getNodeInfo: jest.fn().mockResolvedValue({
          version: 280100,
          protocolVersion: 70016,
          blocks: 800000,
          connections: 8,
          difficulty: 53911173001054.59,
          mempool: {
            size: 12345,
            bytes: 5678901,
            usage: 7890123
          }
        }),
        getPeers: jest.fn().mockResolvedValue([
          /* Mock peer data */
        ]),
        // Additional mocked methods
      };
    })
  };
});
```

## Deployment Patterns

### 20. Build Patterns - `.augment/patterns/BuildPatterns.md`

These patterns establish how the application is built for production:

- **Frontend Build Process**: Optimizing Next.js for production deployment
- **Backend Build Process**: Compiling TypeScript to JavaScript for production
- **Environment Configuration**: Managing environment variables across environments
- **Asset Optimization**: Minimizing and optimizing static assets
- **Bundle Analysis**: Monitoring and optimizing bundle size
- **Source Maps**: Handling source maps in production
- **Build Automation**: Scripts for consistent build processes
- **Version Management**: Including version information in builds
- **Build Artifacts**: Managing and organizing build outputs

Example build pattern:
```typescript
// package.json build scripts
{
  "scripts": {
    "build": "npm run build:backend && npm run build:frontend",
    "build:backend": "cd backend && npm run build",
    "build:frontend": "cd frontend && npm run build",
    "analyze": "cd frontend && ANALYZE=true npm run build",
    "postbuild": "node scripts/post-build.js"
  }
}

// next.config.js
const { withSentryConfig } = require('@sentry/nextjs');
const { PHASE_PRODUCTION_BUILD } = require('next/constants');
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = (phase) => {
  const baseConfig = {
    reactStrictMode: true,
    swcMinify: true,
    images: {
      domains: ['localhost'],
    },
    env: {
      APP_VERSION: process.env.npm_package_version,
      BUILD_TIME: new Date().toISOString(),
    },
    webpack: (config, { isServer }) => {
      // Custom webpack configuration
      return config;
    },
  };
  
  // Production-specific configuration
  if (phase === PHASE_PRODUCTION_BUILD) {
    // Add production optimizations
  }
  
  // Apply plugins
  return withSentryConfig(withBundleAnalyzer(baseConfig));
};
```

### 21. Apache Deployment Patterns - `.augment/patterns/ApacheDeploymentPatterns.md`

These patterns establish how the application is deployed with Apache:

- **Virtual Host Configuration**: Setting up Apache virtual hosts
- **Reverse Proxy Setup**: Configuring Apache as a reverse proxy for Node.js
- **SSL Configuration**: Implementing HTTPS with Let's Encrypt
- **URL Rewriting**: Handling URL rewrites and redirects
- **Static File Serving**: Optimizing static file delivery
- **Compression**: Enabling Gzip/Brotli compression
- **Caching Headers**: Configuring proper caching headers
- **Security Headers**: Implementing security-related HTTP headers
- **Access Control**: Restricting access to sensitive areas
- **Logging**: Configuring Apache logs for monitoring

Example Apache deployment pattern:
```apache
# Virtual host configuration
<VirtualHost *:80>
    ServerName bitcoin-node-manager.example.com
    ServerAdmin webmaster@example.com
    
    # Redirect HTTP to HTTPS
    RewriteEngine On
    RewriteCond %{HTTPS} off
    RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</VirtualHost>

<VirtualHost *:443>
    ServerName bitcoin-node-manager.example.com
    ServerAdmin webmaster@example.com
    
    # Document root for static files
    DocumentRoot /var/www/bitcoin-node-manager/frontend/out
    
    # SSL Configuration
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/bitcoin-node-manager.example.com/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/bitcoin-node-manager.example.com/privkey.pem
    
    # Reverse proxy for API requests
    ProxyRequests Off
    ProxyPreserveHost On
    
    # API requests
    ProxyPass /api http://localhost:3001/api
    ProxyPassReverse /api http://localhost:3001/api
    
    # WebSocket support
    ProxyPass /socket.io http://localhost:3001/socket.io
    ProxyPassReverse /socket.io http://localhost:3001/socket.io
    
    # Static file handling
    <Directory /var/www/bitcoin-node-manager/frontend/out>
        Options -Indexes +FollowSymLinks
        AllowOverride None
        Require all granted
        
        # Cache static assets
        <FilesMatch "\.(jpg|jpeg|png|gif|ico|css|js)$">
            Header set Cache-Control "max-age=31536000, public"
        </FilesMatch>
    </Directory>
    
    # Security headers
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    Header always set Content-Security-Policy "default-src 'self'; script-src 'self'; connect-src 'self' wss://bitcoin-node-manager.example.com; img-src 'self' data:; style-src 'self' 'unsafe-inline';"
    
    # Logging
    ErrorLog ${APACHE_LOG_DIR}/bitcoin-node-manager-error.log
    CustomLog ${APACHE_LOG_DIR}/bitcoin-node-manager-access.log combined
</VirtualHost>
```

### 22. Node.js Production Patterns - `.augment/patterns/NodeProductionPatterns.md`

These patterns establish how the Node.js application is run in production:

- **Process Management**: Using PM2 to manage Node.js processes
- **Clustering**: Utilizing multiple CPU cores with cluster mode
- **Memory Management**: Monitoring and optimizing memory usage
- **Logging**: Implementing structured logging for production
- **Error Handling**: Graceful handling of uncaught exceptions
- **Graceful Shutdown**: Properly handling process termination
- **Health Checks**: Implementing health check endpoints
- **Performance Monitoring**: Tracking application performance
- **Auto-Restart**: Automatically restarting on crashes
- **Log Rotation**: Managing log files to prevent disk space issues

Example Node.js production pattern:
```typescript
// ecosystem.config.js for PM2
module.exports = {
  apps: [
    {
      name: 'bitcoin-node-manager',
      script: 'dist/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      combine_logs: true,
      error_file: 'logs/error.log',
      out_file: 'logs/out.log',
      merge_logs: true,
      time: true
    }
  ]
};

// server.js with graceful shutdown
import express from 'express';
import http from 'http';
import { createTerminus } from '@godaddy/terminus';

const app = express();
const server = http.createServer(app);

// Health check function
const onHealthCheck = async () => {
  // Check database connection
  await prisma.$queryRaw`SELECT 1`;
  
  // Check Bitcoin RPC connection
  await bitcoinService.getNodeInfo();
  
  return { status: 'ok' };
};

// Cleanup function
const onSignal = async () => {
  console.log('Server is shutting down...');
  
  // Close database connections
  await prisma.$disconnect();
  
  // Close any other resources
  console.log('Cleanup completed');
};

// Set up terminus for graceful shutdown
createTerminus(server, {
  signal: 'SIGINT',
  healthChecks: {
    '/health': onHealthCheck,
    '/healthz': onHealthCheck,
  },
  onSignal,
  onShutdown: async () => {
    console.log('Server has shut down');
  },
  logger: console.log
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## How to Use These Patterns

Each pattern document contains:

1. **Overview** - A brief description of the pattern and its purpose
2. **Implementation Examples** - Code snippets showing how to implement the pattern
3. **Best Practices** - Guidelines for using the pattern effectively
4. **Common Pitfalls** - Issues to avoid when implementing the pattern
5. **Testing Considerations** - How to test implementations of the pattern

When implementing a feature, refer to the relevant pattern documents to ensure consistency and follow best practices. These patterns are designed to work together to create a cohesive application architecture.

For AI-assisted development, these patterns provide clear templates that can be adapted to specific requirements while maintaining architectural consistency. When requesting AI assistance, reference the specific pattern you're implementing to ensure the generated code follows the established conventions.

### Pattern Application Process

1. **Identify the Feature** - Determine what feature you need to implement
2. **Select Relevant Patterns** - Identify which patterns apply to the feature
3. **Reference Pattern Documents** - Review the detailed pattern documentation
4. **Implement Following Patterns** - Write code that adheres to the patterns
5. **Test Implementation** - Verify that the implementation works as expected
6. **Review for Consistency** - Ensure the implementation is consistent with other parts of the application

### Example Pattern Application

For implementing a new "Ban Peer" feature:

1. **Frontend Components**: Apply Basic Component Patterns for UI elements
2. **Form Handling**: Use Form Patterns for the ban form
3. **API Communication**: Apply Data Fetching Patterns for the ban API call
4. **Backend Endpoint**: Implement API Endpoint Patterns for the ban endpoint
5. **Bitcoin RPC**: Use Bitcoin RPC Patterns to call the setban RPC method
6. **Error Handling**: Apply Error Handling Patterns for both frontend and backend
7. **Testing**: Implement Unit and Integration Testing Patterns to verify functionality

By following these patterns consistently, the application will maintain a cohesive architecture that is easier to maintain, extend, and understand. When requesting AI assistance, reference the specific pattern you're implementing to ensure the generated code follows the established conventions.
