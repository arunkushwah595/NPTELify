# Persistent Notifications & Question Bank System

This system stores notifications and question banks in the database, making changes permanent.

## Database Entities

### 1. Notification Entity
Stores all notifications for users with read status tracking.

**Table**: `notifications`

| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT | Primary key |
| user_id | BIGINT | Foreign key to users table |
| type | VARCHAR | Notification type (e.g., "quiz_starting_soon", "quiz_live", "results_available") |
| title | VARCHAR(500) | Notification title |
| message | VARCHAR(1000) | Notification message |
| is_read | BOOLEAN | Whether notification is read |
| created_at | TIMESTAMP | When notification was created |
| read_at | TIMESTAMP | When notification was marked as read |

### 2. UserQuestionBank Entity
Stores questions saved by users.

**Table**: `user_question_banks`

| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT | Primary key |
| user_id | BIGINT | Foreign key to users table |
| question_id | BIGINT | Foreign key to questions table |
| added_at | TIMESTAMP | When question was added to bank |

**Unique Constraint**: (user_id, question_id) - Each user can save each question only once

## REST API Endpoints

### Notifications API

**Base Path**: `/api/notifications`

#### Get All Notifications
```
GET /api/notifications
Response: List<NotificationResponse>
```

#### Get Unread Notifications
```
GET /api/notifications/unread
Response: List<NotificationResponse>
```

#### Get Unread Count
```
GET /api/notifications/unread-count
Response: {
  "unreadCount": 5
}
```

#### Mark Notification as Read
```
PUT /api/notifications/{id}/read
Response: NotificationResponse
```

#### Mark All Notifications as Read
```
PUT /api/notifications/mark-all-read
Response: {
  "message": "All notifications marked as read"
}
```

#### Delete Notification
```
DELETE /api/notifications/{id}
Response: {
  "message": "Notification deleted"
}
```

#### Get Recent Notifications (Limited)
```
GET /api/notifications/recent/{limit}
Response: List<NotificationResponse>
```

### Question Bank API

**Base Path**: `/api/question-bank`

#### Add Question to Question Bank
```
POST /api/question-bank/add/{questionId}
Response: {
  "message": "Question added to question bank"
}
```

#### Remove Question from Question Bank
```
POST /api/question-bank/remove/{questionId}
Response: {
  "message": "Question removed from question bank"
}
```

#### Get All Questions in Question Bank
```
GET /api/question-bank
Response: List<QuestionBankResponse>
```

Example Response:
```json
[
  {
    "questionId": 1,
    "text": "What is the capital of France?",
    "options": ["Paris", "London", "Berlin", "Madrid"],
    "correctOption": 0,
    "addedAt": "2026-03-31T10:30:00",
    "quizId": 5,
    "quizTitle": "Geography Quiz"
  }
]
```

#### Check if Question is in Question Bank
```
GET /api/question-bank/check/{questionId}
Response: {
  "isInQuestionBank": true
}
```

#### Get Question Bank Count
```
GET /api/question-bank/count
Response: {
  "count": 15
}
```

#### Clear All Questions from Question Bank
```
DELETE /api/question-bank/clear
Response: {
  "message": "Question bank cleared"
}
```

## Services

### NotificationService
Handles all notification operations:
- `createNotification(User, type, title, message)` - Create a new notification
- `getUserNotifications(User)` - Get all notifications for a user
- `getUnreadNotifications(User)` - Get unread notifications
- `getUnreadCount(User)` - Get count of unread notifications
- `markAsRead(notificationId)` - Mark a notification as read
- `markAllAsRead(User)` - Mark all notifications as read for a user
- `deleteNotification(notificationId)` - Delete a notification
- `getRecentNotifications(User, limit)` - Get recent notifications

### QuestionBankService
Handles all question bank operations:
- `addToQuestionBank(User, Question)` - Add question to user's bank
- `removeFromQuestionBank(User, Question)` - Remove question from bank
- `getUserQuestionBank(User)` - Get all questions in user's bank
- `getUserQuestions(User)` - Get questions (without wrapper)
- `isInQuestionBank(User, Question)` - Check if question is in bank
- `getQuestionBankSize(User)` - Get count of questions in bank
- `clearQuestionBank(User)` - Clear all questions from bank

## Backend Integration Example

### Creating a Notification
```java
User user = userDetailsService.getCurrentUser();
notificationService.createNotification(
    user,
    "quiz_live",
    "Your Quiz is Live!",
    "The quiz 'Data Structures' is now available for taking."
);
```

### Adding to Question Bank
```java
User user = userDetailsService.getCurrentUser();
Question question = questionRepository.findById(questionId).orElseThrow();
questionBankService.addToQuestionBank(user, question);
```

## Frontend Integration Example

### Fetch Notifications
```javascript
const response = await fetch('http://localhost:8080/api/notifications', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const notifications = await response.json();
```

### Mark Notification as Read
```javascript
const response = await fetch(`http://localhost:8080/api/notifications/${notificationId}/read`, {
  method: 'PUT',
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### Add to Question Bank
```javascript
const response = await fetch(`http://localhost:8080/api/question-bank/add/${questionId}`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### Get Question Bank
```javascript
const response = await fetch('http://localhost:8080/api/question-bank', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const questionBank = await response.json();
```

## Database Migration

When you next start the application with `spring.jpa.hibernate.ddl-auto=update`, Hibernate will automatically create these tables:

- `notifications`
- `user_question_banks`

No manual SQL needed!

## Key Features

✅ **Permanent Storage**: All notifications and questions saved in database  
✅ **Read Status Tracking**: Notifications track when they were marked as read  
✅ **User-Specific**: Each user has their own notifications and question bank  
✅ **Automatic Timestamps**: Creation and read timestamps are automatically set  
✅ **Performance**: Indexed queries on user_id for fast retrieval  
✅ **Duplicate Prevention**: Question bank prevents duplicate entries per user  
