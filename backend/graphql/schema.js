const { gql } = require('apollo-server-express');

const typeDefs = gql`
  scalar Date
  scalar JSON

  type User {
    id: ID!
    username: String!
    email: String!
    role: UserRole!
    department: String
    isActive: Boolean!
    createdAt: Date!
    lastLogin: Date
    projects: [Project!]
  }

  type Scheme {
    id: ID!
    schCode: String!
    schName: String!
    schType: SchemeType!
    totalBudget: Float!
    usedBudget: Float!
    startDate: Date
    endDate: Date
    status: SchemeStatus!
    projects: [Project!]
    analytics: Analytics
  }

  type Project {
    id: ID!
    projCode: String!
    projName: String!
    scheme: Scheme!
    location: Location
    allocatedBudget: Float!
    spentBudget: Float!
    progress: Float!
    status: ProjectStatus!
    works: [Work!]
    team: [User!]
    insights: AIInsights
    predictions: Predictions
  }

  type Work {
    id: ID!
    workCode: String!
    workName: String!
    project: Project!
    contractor: String
    startDate: Date
    completionDate: Date
    progress: Float!
    photos: [Photo!]
    anomalies: [Anomaly!]
  }

  type Location {
    district: String
    mandal: String
    village: String
    latitude: Float
    longitude: Float
  }

  type Photo {
    id: ID!
    url: String!
    uploadedAt: Date!
    description: String
    aiAnalysis: String
  }

  type Analytics {
    totalProjects: Int!
    completedProjects: Int!
    budgetUtilization: Float!
    averageProgress: Float!
    riskScore: Float!
    trends: [Trend!]
  }

  type AIInsights {
    analysis: String!
    riskAssessment: RiskLevel!
    recommendations: [String!]
    generatedAt: Date!
  }

  type Predictions {
    completionDate: Date
    completionProbability: Float
    budgetOverrunRisk: Float
    recommendations: [String!]
  }

  type Anomaly {
    id: ID!
    type: AnomalyType!
    severity: Severity!
    description: String!
    detectedAt: Date!
    resolved: Boolean!
  }

  type Trend {
    metric: String!
    value: Float!
    change: Float!
    prediction: Float
  }

  type Notification {
    id: ID!
    type: String!
    message: String!
    data: JSON
    timestamp: Date!
    read: Boolean!
  }

  type SearchResult {
    schemes: [Scheme!]
    projects: [Project!]
    works: [Work!]
    totalResults: Int!
    facets: JSON
  }

  type DashboardMetrics {
    overview: Overview!
    performance: Performance!
    alerts: [Alert!]
    recommendations: [String!]
  }

  type Overview {
    totalSchemes: Int!
    totalProjects: Int!
    totalWorks: Int!
    totalBudget: Float!
    spentBudget: Float!
    averageProgress: Float!
  }

  type Performance {
    responseTime: Float!
    uptime: Float!
    errorRate: Float!
    activeUsers: Int!
    cacheHitRate: Float!
  }

  type Alert {
    id: ID!
    level: AlertLevel!
    message: String!
    timestamp: Date!
  }

  enum UserRole {
    ADMIN
    MANAGER
    USER
    VIEWER
  }

  enum SchemeType {
    CENTRAL
    STATE
    LOCAL
  }

  enum SchemeStatus {
    ACTIVE
    COMPLETED
    PENDING
    CANCELLED
  }

  enum ProjectStatus {
    PLANNING
    IN_PROGRESS
    COMPLETED
    ON_HOLD
    DELAYED
  }

  enum RiskLevel {
    LOW
    MEDIUM
    HIGH
    CRITICAL
  }

  enum AnomalyType {
    BUDGET
    TIMELINE
    PERFORMANCE
    RESOURCE
  }

  enum Severity {
    LOW
    MEDIUM
    HIGH
    CRITICAL
  }

  enum AlertLevel {
    INFO
    WARNING
    ERROR
    CRITICAL
  }

  input SchemeInput {
    schCode: String!
    schName: String!
    schType: SchemeType!
    totalBudget: Float!
    startDate: Date
    endDate: Date
  }

  input ProjectInput {
    projCode: String!
    projName: String!
    schCode: String!
    location: LocationInput
    allocatedBudget: Float!
  }

  input LocationInput {
    district: String
    mandal: String
    village: String
    latitude: Float
    longitude: Float
  }

  input SearchInput {
    query: String!
    filters: JSON
    sort: String
    limit: Int
    offset: Int
  }

  type Query {
    # User queries
    me: User
    user(id: ID!): User
    users(role: UserRole, department: String): [User!]

    # Scheme queries
    scheme(id: ID!): Scheme
    schemeByCode(schCode: String!): Scheme
    schemes(status: SchemeStatus, type: SchemeType): [Scheme!]

    # Project queries
    project(id: ID!): Project
    projectByCode(projCode: String!): Project
    projects(schCode: String, status: ProjectStatus): [Project!]
    projectsNearLocation(latitude: Float!, longitude: Float!, radius: Float!): [Project!]

    # Work queries
    work(id: ID!): Work
    works(projCode: String, contractor: String): [Work!]

    # Analytics queries
    dashboardMetrics: DashboardMetrics
    projectInsights(projCode: String!): AIInsights
    projectPredictions(projCode: String!): Predictions
    anomalies(severity: Severity): [Anomaly!]

    # Search queries
    search(input: SearchInput!): SearchResult
    naturalLanguageQuery(query: String!): SearchResult

    # Notification queries
    notifications(unreadOnly: Boolean): [Notification!]
    
    # Performance queries
    systemPerformance: Performance
    alerts(level: AlertLevel): [Alert!]
  }

  type Mutation {
    # Auth mutations
    login(username: String!, password: String!): AuthPayload
    register(username: String!, email: String!, password: String!): AuthPayload
    refreshToken(token: String!): AuthPayload

    # Scheme mutations
    createScheme(input: SchemeInput!): Scheme
    updateScheme(id: ID!, input: SchemeInput!): Scheme
    deleteScheme(id: ID!): Boolean
    
    # Project mutations
    createProject(input: ProjectInput!): Project
    updateProject(id: ID!, input: ProjectInput!): Project
    deleteProject(id: ID!): Boolean
    assignTeamToProject(projCode: String!, userIds: [ID!]!): Project
    
    # Work mutations
    createWork(projCode: String!, workName: String!): Work
    updateWorkProgress(workCode: String!, progress: Float!): Work
    uploadWorkPhoto(workCode: String!, photo: Upload!): Photo
    
    # AI mutations
    generateInsights(projCode: String!): AIInsights
    predictCompletion(projCode: String!): Predictions
    processNaturalQuery(query: String!): JSON
    
    # Notification mutations
    markNotificationRead(id: ID!): Notification
    markAllNotificationsRead: Boolean
    
    # Anomaly mutations
    resolveAnomaly(id: ID!): Anomaly
    reportAnomaly(type: AnomalyType!, description: String!): Anomaly
  }

  type Subscription {
    # Real-time subscriptions
    projectUpdated(projCode: String!): Project
    workProgressUpdated(projCode: String!): Work
    newNotification: Notification
    anomalyDetected: Anomaly
    userStatusChanged: UserStatus
    metricsUpdated: DashboardMetrics
  }

  type AuthPayload {
    token: String!
    user: User!
    expiresIn: Int!
  }

  type UserStatus {
    userId: ID!
    isOnline: Boolean!
    lastSeen: Date
  }
`; 

module.exports = typeDefs;