import chokidar from 'chokidar';
import swaggerJsdoc from 'swagger-jsdoc';
import fs from 'fs';
import path from 'path';

const swaggerOutputPath = path.join(__dirname, '../swagger-output.json');

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Comment System API',
            version: '1.0.0',
            description: 'A comprehensive comment system API with authentication, comments, likes, and real-time updates via WebSocket',
            contact: {
                name: 'API Support',
                email: 'support@example.com'
            },
            license: {
                name: 'ISC',
                url: 'https://opensource.org/licenses/ISC'
            }
        },
        servers: [
            {
                url: 'http://localhost:5000',
                description: 'Development server'
            },
            {
                url: process.env.API_URL || 'https://api.example.com',
                description: 'Production server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'JWT authentication token. Format: Bearer {token}'
                }
            },
            schemas: {
                // Authentication schemas
                RegisterRequest: {
                    type: 'object',
                    required: ['email', 'username', 'password'],
                    properties: {
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'User email address',
                            example: 'user@example.com'
                        },
                        username: {
                            type: 'string',
                            minLength: 3,
                            maxLength: 30,
                            pattern: '^[a-zA-Z0-9_]+$',
                            description: 'Username (letters, numbers, and underscores only)',
                            example: 'john_doe'
                        },
                        password: {
                            type: 'string',
                            minLength: 6,
                            description: 'User password (minimum 6 characters)',
                            example: 'password123'
                        },
                        name: {
                            type: 'string',
                            maxLength: 100,
                            description: 'User full name (optional)',
                            example: 'John Doe'
                        }
                    }
                },
                LoginRequest: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'User email address',
                            example: 'user@example.com'
                        },
                        password: {
                            type: 'string',
                            description: 'User password',
                            example: 'password123'
                        }
                    }
                },
                AuthResponse: {
                    type: 'object',
                    properties: {
                        user: {
                            $ref: '#/components/schemas/User'
                        },
                        token: {
                            type: 'string',
                            description: 'JWT authentication token',
                            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                        }
                    }
                },
                User: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            description: 'User unique identifier',
                            example: 'clm1234567890abc'
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'User email address',
                            example: 'user@example.com'
                        },
                        username: {
                            type: 'string',
                            description: 'Username',
                            example: 'john_doe'
                        },
                        name: {
                            type: 'string',
                            description: 'User full name',
                            example: 'John Doe'
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Account creation date',
                            example: '2024-01-01T00:00:00.000Z'
                        }
                    }
                },
                // Comment schemas
                CreateCommentRequest: {
                    type: 'object',
                    required: ['content'],
                    properties: {
                        content: {
                            type: 'string',
                            description: 'Comment content',
                            example: 'This is a great post!'
                        },
                        parentId: {
                            type: 'string',
                            description: 'Parent comment ID (for replies)',
                            example: 'clm1234567890abc'
                        }
                    }
                },
                UpdateCommentRequest: {
                    type: 'object',
                    required: ['content'],
                    properties: {
                        content: {
                            type: 'string',
                            description: 'Updated comment content',
                            example: 'This is an updated comment'
                        }
                    }
                },
                Comment: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            description: 'Comment unique identifier',
                            example: 'clm1234567890abc'
                        },
                        content: {
                            type: 'string',
                            description: 'Comment content',
                            example: 'This is a great post!'
                        },
                        authorId: {
                            type: 'string',
                            description: 'Author user ID',
                            example: 'clm1234567890abc'
                        },
                        parentId: {
                            type: 'string',
                            description: 'Parent comment ID (for replies)',
                            example: 'clm1234567890abc'
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Comment creation date',
                            example: '2024-01-01T00:00:00.000Z'
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Comment last update date',
                            example: '2024-01-01T00:00:00.000Z'
                        }
                    }
                },
                CommentWithDetails: {
                    allOf: [
                        { $ref: '#/components/schemas/Comment' },
                        {
                            type: 'object',
                            properties: {
                                author: {
                                    type: 'object',
                                    properties: {
                                        id: { type: 'string' },
                                        username: { type: 'string' },
                                        name: { type: 'string' }
                                    }
                                },
                                _count: {
                                    type: 'object',
                                    properties: {
                                        replies: { type: 'number' },
                                        likes: { type: 'number' }
                                    }
                                },
                                likesCount: {
                                    type: 'number',
                                    description: 'Number of likes'
                                },
                                dislikesCount: {
                                    type: 'number',
                                    description: 'Number of dislikes'
                                }
                            }
                        }
                    ]
                },
                // Like schemas
                Like: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            description: 'Like unique identifier',
                            example: 'clm1234567890abc'
                        },
                        userId: {
                            type: 'string',
                            description: 'User ID who created like',
                            example: 'clm1234567890abc'
                        },
                        commentId: {
                            type: 'string',
                            description: 'Comment ID (if liking a comment)',
                            example: 'clm1234567890abc'
                        },
                        replyId: {
                            type: 'string',
                            description: 'Reply ID (if liking a reply)',
                            example: 'clm1234567890abc'
                        },
                        type: {
                            type: 'string',
                            enum: ['like', 'dislike'],
                            description: 'Type of like',
                            example: 'like'
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Like creation date',
                            example: '2024-01-01T00:00:00.000Z'
                        }
                    }
                },
                LikeCounts: {
                    type: 'object',
                    properties: {
                        likesCount: {
                            type: 'number',
                            description: 'Number of likes',
                            example: 5
                        },
                        dislikesCount: {
                            type: 'number',
                            description: 'Number of dislikes',
                            example: 2
                        },
                        userLikeStatus: {
                            type: 'object',
                            properties: {
                                hasLiked: {
                                    type: 'boolean',
                                    description: 'Whether the current user has liked',
                                    example: true
                                },
                                hasDisliked: {
                                    type: 'boolean',
                                    description: 'Whether the current user has disliked',
                                    example: false
                                }
                            }
                        }
                    }
                },
                // Pagination schemas
                PaginationMetadata: {
                    type: 'object',
                    properties: {
                        page: {
                            type: 'number',
                            description: 'Current page number',
                            example: 1
                        },
                        limit: {
                            type: 'number',
                            description: 'Number of items per page',
                            example: 10
                        },
                        total: {
                            type: 'number',
                            description: 'Total number of items',
                            example: 100
                        },
                        totalPages: {
                            type: 'number',
                            description: 'Total number of pages',
                            example: 10
                        }
                    }
                },
                // Error schemas
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        message: {
                            type: 'string',
                            description: 'Error message',
                            example: 'An error occurred'
                        },
                        error: {
                            type: 'string',
                            description: 'Error code',
                            example: 'ERROR_CODE'
                        },
                        errors: {
                            type: 'array',
                            description: 'Validation errors (if applicable)',
                            items: {
                                type: 'object',
                                properties: {
                                    field: {
                                        type: 'string',
                                        description: 'Field name',
                                        example: 'email'
                                    },
                                    message: {
                                        type: 'string',
                                        description: 'Error message',
                                        example: 'Invalid email format'
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        security: [
            {
                bearerAuth: []
            }
        ],
        tags: [
            { name: 'Authentication', description: 'User authentication endpoints' },
            { name: 'Users', description: 'User management endpoints' },
            { name: 'Comments', description: 'Comment CRUD and replies' },
            { name: 'Likes', description: 'Like/dislike operations' }
        ]
    },
    // Use absolute paths to ensure swagger-jsdoc finds the files
    apis: [
        path.join(__dirname, '../routes/*.ts'),
        path.join(__dirname, '../controllers/*.ts')
    ]
};

/**
 * Generate Swagger documentation from JSDoc comments
 */
const generateSwaggerDocs = () => {
    try {
        const swaggerSpec = swaggerJsdoc(swaggerOptions);
        fs.writeFileSync(swaggerOutputPath, JSON.stringify(swaggerSpec, null, 2));
        console.log('✅ Swagger documentation generated successfully');
        console.log(`📄 Output file: ${swaggerOutputPath}`);
        return swaggerSpec;
    } catch (error) {
        console.error('❌ Error generating Swagger documentation:', error);
        return null;
    }
};

/**
 * Start watching for file changes and auto-regenerate Swagger docs
 */
export const startSwaggerWatcher = () => {
    if (process.env.NODE_ENV !== 'development') {
        console.log('⚠️  Swagger watcher only runs in development mode');
        return;
    }

    console.log('👀 Starting Swagger documentation watcher...');

    // Initial generation
    generateSwaggerDocs();

    // Watch for changes in routes and controllers
    const watchPaths = [
        path.join(__dirname, '../routes/*.ts'),
        path.join(__dirname, '../controllers/*.ts')
    ];

    chokidar.watch(watchPaths, {
        ignored: /(^|[\/\\])\../, // ignore dotfiles
        persistent: true
    }).on('change', (filePath) => {
        console.log(`📝 File changed: ${filePath}`);
        console.log('🔄 Regenerating Swagger documentation...');
        generateSwaggerDocs();
    }).on('error', (error) => {
        console.error('❌ Watcher error:', error);
    });

    console.log('👀 Watching for changes in routes and controllers...');
};

// Auto-start watcher in development
if (process.env.NODE_ENV === 'development') {
    startSwaggerWatcher();
}

export { generateSwaggerDocs };