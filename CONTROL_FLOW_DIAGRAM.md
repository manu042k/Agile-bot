# Project Management App - Control Flow Diagrams

## 1. Main Application Flow

```
┌─────────────────┐
│  Landing Page   │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌───────┐  ┌──────────┐
│ Login │  │ Register │
└───┬───┘  └────┬─────┘
    │           │
    └─────┬─────┘
          │
          ▼
    ┌──────────┐
    │ Dashboard│
    └────┬─────┘
         │
    ┌────┴────────────────────────────────────┐
    │                                          │
    ▼                                          ▼
┌─────────┐                            ┌──────────┐
│Projects │                            │  Tasks   │
└────┬────┘                            └────┬─────┘
     │                                          │
     │                                          │
     ▼                                          ▼
┌──────────────────┐                  ┌──────────────┐
│ Project Detail   │                  │ Task Detail  │
│  - Overview      │                  │  - Info      │
│  - Board         │                  │  - Comments  │
│  - Tasks         │                  │  - History   │
│  - Timeline      │                  └──────────────┘
│  - Team          │
│  - Documents     │
│  - Analytics      │
│  - Settings      │
└──────────────────┘
```

## 2. Project Creation Flow

```
Dashboard/Projects Page
         │
         ▼
    [Create Project Button]
         │
         ▼
┌────────────────────┐
│ Project Form Modal  │
│  - Name            │
│  - Description     │
│  - Team Selection  │
│  - Visibility      │
└─────────┬──────────┘
          │
          ▼
    [Create Button]
          │
          ▼
┌─────────────────────┐
│ Project Created     │
│ Redirect to:        │
│ /projects/[id]      │
└──────────┬──────────┘
           │
           ▼
    ┌──────────────┐
    │ Upload Docs? │
    └──┬───────┬───┘
       │       │
    Yes│       │No
       │       │
       ▼       ▼
┌──────────┐ ┌──────────────┐
│Upload    │ │ Generate     │
│Documents │ │ Tasks (AI)?  │
└────┬─────┘ └──┬───────┬───┘
     │          │       │
     │       Yes│       │No
     │          │       │
     └──────┬───┘       │
            │           │
            ▼           ▼
    ┌──────────────┐ ┌──────────┐
    │ Review Tasks │ │ Board    │
    │ Refine/Edit  │ │ View     │
    └──────┬───────┘ └──────────┘
           │
           ▼
    ┌──────────┐
    │ Start    │
    │ Working  │
    └──────────┘
```

## 3. Task Management Flow

```
Multiple Entry Points:
  - Dashboard → My Tasks
  - Projects → Tasks Tab
  - Board View
  - Global Tasks Page
         │
         ▼
┌─────────────────┐
│ Task List/Board │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
[Create]   [Click Task]
    │         │
    │         ▼
    │    ┌──────────────┐
    │    │ Task Detail  │
    │    │  - Edit Info │
    │    │  - Assign    │
    │    │  - Comment   │
    │    │  - Update    │
    │    │    Status    │
    │    └──────┬───────┘
    │           │
    └───────────┘
           │
           ▼
    ┌──────────────┐
    │ Status Change│
    │ Notification │
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │ Board Update │
    │ (Real-time)  │
    └──────────────┘
```

## 4. Team Collaboration Flow

```
Teams Page
    │
    ▼
┌──────────────┐
│ Team List    │
└──────┬───────┘
       │
   ┌───┴───┐
   │       │
[Create] [View]
   │       │
   │       ▼
   │  ┌──────────────┐
   │  │ Team Detail  │
   │  │  - Members   │
   │  │  - Projects  │
   │  │  - Activity  │
   │  └──────┬───────┘
   │         │
   │    ┌────┴────┐
   │    │         │
   │ [Add]    [Assign]
   │ Member    to Project
   │    │         │
   │    │         ▼
   │    │    ┌──────────────┐
   │    │    │ Project      │
   │    │    │ Team Updated │
   │    │    └──────┬───────┘
   │    │           │
   │    └───────────┘
   │           │
   │           ▼
   │    ┌──────────────┐
   │    │ Assign Tasks │
   │    │ to Members   │
   │    └──────┬───────┘
   │           │
   │           ▼
   │    ┌──────────────┐
   │    │ Notifications│
   │    │ Sent         │
   │    └──────────────┘
   │
   └─────────────────────┘
```

## 5. Document Workflow

```
Project Detail → Documents Tab
         │
         ▼
┌─────────────────┐
│ Document List   │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
[Upload]   [View]
    │         │
    │         ▼
    │    ┌──────────────┐
    │    │ Document     │
    │    │ Preview      │
    │    └──────┬───────┘
    │           │
    │      [Link to Task]
    │           │
    │           ▼
    │    ┌──────────────┐
    │    │ Task Detail  │
    │    │ (with doc)   │
    │    └──────────────┘
    │
    ▼
┌─────────────────┐
│ AI Processing?  │
└──┬──────────┬───┘
   │          │
Yes│          │No
   │          │
   ▼          ▼
┌─────────┐ ┌──────────┐
│Generate │ │ Manual   │
│Tasks    │ │ Task     │
│from Doc │ │ Creation │
└────┬────┘ └──────────┘
     │
     ▼
┌──────────────┐
│ Review Tasks │
│ Link to Doc  │
└──────────────┘
```

## 6. User Authentication Flow

```
Landing Page
     │
     ├───→ Login ───→ Forgot Password ───→ Reset Password
     │         │              │                    │
     │         │              │                    │
     │         └──────────────┴────────────────────┘
     │                           │
     │                           ▼
     │                    ┌──────────────┐
     │                    │ Login Success │
     │                    └──────┬───────┘
     │                           │
     │                           ▼
     │                    ┌──────────────┐
     │                    │  Dashboard  │
     │                    └─────────────┘
     │
     └───→ Register ───→ Email Verification (optional)
                │                │
                │                │
                └────────────────┘
                         │
                         ▼
                  ┌──────────────┐
                  │ Onboarding   │
                  │ Wizard       │
                  └──────┬───────┘
                         │
                         ▼
                  ┌──────────────┐
                  │  Dashboard   │
                  └──────────────┘
```

## 7. Navigation Patterns

### 7.1 Primary Navigation
```
┌─────────────────────────────────────────┐
│  Logo  │ Dashboard │ Projects │ Tasks  │
│        │           │          │        │
│        │           │          │ Teams  │
│        │           │          │        │
│        │           │          │ Docs   │
│        │           │          │        │
│        │           │          │ Analytics│
└─────────────────────────────────────────┘
```

### 7.2 Contextual Navigation (Project Detail)
```
┌─────────────────────────────────────────┐
│  ← Back  │ Project Name                  │
│          │                               │
│          │ [Overview] [Board] [Tasks]   │
│          │ [Timeline] [Team] [Docs]     │
│          │ [Analytics] [Settings]       │
└─────────────────────────────────────────┘
```

## 8. State Transitions

### 8.1 Task Status Flow
```
┌─────────┐
│ Backlog │
└────┬────┘
     │
     ▼
┌──────────┐
│ To Do    │
└────┬─────┘
     │
     ├──────→ ┌─────────────┐
     │        │ In Progress  │
     │        └──────┬───────┘
     │               │
     │               ├──────→ ┌──────────┐
     │               │        │ Review    │
     │               │        └─────┬────┘
     │               │              │
     │               │              ▼
     │               │        ┌──────────┐
     │               │        │ Done     │
     │               │        └──────────┘
     │               │
     │               └──────→ ┌──────────┐
     │                        │ Done     │
     │                        └──────────┘
     │
     └──────────────────────→ ┌──────────┐
                              │ Done     │
                              └──────────┘
```

### 8.2 Project Status Flow
```
┌──────────┐
│ Planning │
└────┬─────┘
     │
     ▼
┌──────────┐
│ Active   │
└────┬─────┘
     │
     ├──────→ ┌──────────┐
     │        │ On Hold  │
     │        └────┬─────┘
     │             │
     │             └──→ ┌──────────┐
     │                  │ Active   │
     │                  └──────────┘
     │
     └──────→ ┌──────────┐
              │ Completed │
              └──────────┘
```

## 9. Permission-Based Access Flow

```
User Action
     │
     ▼
┌──────────────┐
│ Check Role   │
│ & Permission │
└──┬───────┬───┘
   │       │
   │   ┌───┴───┐
   │   │       │
   │ Allowed  Denied
   │   │       │
   │   │       ▼
   │   │  ┌──────────────┐
   │   │  │ Error Message│
   │   │  │ "Access      │
   │   │  │  Denied"     │
   │   │  └──────────────┘
   │   │
   │   ▼
┌──────────────┐
│ Execute      │
│ Action       │
└──────────────┘
```

## 10. Real-time Update Flow

```
User Action (e.g., Task Status Change)
     │
     ▼
┌──────────────┐
│ Update Local │
│ State        │
│ (Optimistic) │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Send to     │
│ Backend      │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ WebSocket    │
│ Broadcast    │
└──────┬───────┘
       │
       ├──→ Other Users' Clients
       │    └──→ UI Update
       │
       └──→ Current User's Client
            └──→ Confirm Update
```

---

## Key Design Principles

1. **Progressive Disclosure**: Show complexity gradually
2. **Consistent Navigation**: Same patterns throughout
3. **Contextual Actions**: Actions relevant to current view
4. **Feedback Loops**: Clear confirmation of actions
5. **Error Recovery**: Graceful error handling
6. **Performance**: Fast, responsive interactions
7. **Accessibility**: Keyboard navigation, screen readers
8. **Mobile-First**: Responsive design

