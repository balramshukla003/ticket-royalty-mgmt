export const ROLES = {
  AUTHOR:      'AUTHOR',
  ADMIN:       'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
};

export const TICKET_STATUS = {
  OPEN:        'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED:    'RESOLVED',
  CLOSED:      'CLOSED',
};

export const TICKET_CATEGORY = {
  ROYALTY_PAYMENTS:         'ROYALTY_PAYMENTS',
  ISBN_METADATA:            'ISBN_METADATA',
  PRINTING_QUALITY:         'PRINTING_QUALITY',
  DISTRIBUTION_AVAILABILITY:'DISTRIBUTION_AVAILABILITY',
  BOOK_STATUS_PRODUCTION:   'BOOK_STATUS_PRODUCTION',
  GENERAL_INQUIRY:          'GENERAL_INQUIRY',
};

export const TICKET_PRIORITY = {
  CRITICAL: 'CRITICAL',
  HIGH:     'HIGH',
  MEDIUM:   'MEDIUM',
  LOW:      'LOW',
};

export const AI_STATUS = {
  PENDING: 'PENDING',
  DONE:    'DONE',
  FAILED:  'FAILED',
};

export const BOOK_STATUS = {
  MANUSCRIPT_RECEIVED: 'MANUSCRIPT_RECEIVED',
  EDITING:             'EDITING',
  COVER_DESIGN:        'COVER_DESIGN',
  TYPESETTING:         'TYPESETTING',
  PROOFREADING:        'PROOFREADING',
  ISBN_ASSIGNMENT:     'ISBN_ASSIGNMENT',
  PRINTING:            'PRINTING',
  DISTRIBUTION_SETUP:  'DISTRIBUTION_SETUP',
  PUBLISHED_LIVE:      'PUBLISHED_LIVE',
};

export const BOOK_STATUS_LABELS = {
  MANUSCRIPT_RECEIVED: 'Manuscript Received',
  EDITING:             'Editing',
  COVER_DESIGN:        'In Production - Cover Design',
  TYPESETTING:         'In Production - Typesetting',
  PROOFREADING:        'In Production - Proofreading',
  ISBN_ASSIGNMENT:     'In Production - ISBN Assignment',
  PRINTING:            'In Production - Printing',
  DISTRIBUTION_SETUP:  'In Production - Distribution Setup',
  PUBLISHED_LIVE:      'Published & Live',
};

export const CATEGORY_LABELS = {
  ROYALTY_PAYMENTS:         'Royalty & Payments',
  ISBN_METADATA:            'ISBN & Metadata Issues',
  PRINTING_QUALITY:         'Printing & Quality',
  DISTRIBUTION_AVAILABILITY:'Distribution & Availability',
  BOOK_STATUS_PRODUCTION:   'Book Status & Production Updates',
  GENERAL_INQUIRY:          'General Inquiry',
};

export const PRINT_PARTNER_LABELS = {
  IN_HOUSE:     'In-House',
  REPRO_INDIA:  'Repro India',
  EPITOME_BOOKS:'Epitome Books',
};

export const PLATFORM_LABELS = {
  AMAZON_INDIA:   'Amazon India',
  FLIPKART:       'Flipkart',
  AMAZON_US:      'Amazon US',
  AMAZON_UK:      'Amazon UK',
  BOOKLEAF_STORE: 'BookLeaf Store',
};

export const NOTIFICATION_TYPE = {
  TICKET_CREATED:        'TICKET_CREATED',
  TICKET_REPLY:          'TICKET_REPLY',
  TICKET_STATUS_CHANGED: 'TICKET_STATUS_CHANGED',
  TICKET_ASSIGNED:       'TICKET_ASSIGNED',
  AI_FAILED:             'AI_FAILED',
};

export const SOCKET_EVENTS = {
  TICKET_CREATED:       'ticket:created',
  TICKET_AI_COMPLETED:  'ticket:ai_completed',
  TICKET_AI_FAILED:     'ticket:ai_failed',
  TICKET_MESSAGE:       'ticket:message',
  TICKET_STATUS_CHANGED:'ticket:status_changed',
  TICKET_UPDATED:       'ticket:updated',
  TICKET_ASSIGNED:      'ticket:assigned',
  NOTIFICATION:         'notification:new',
  JOIN_TICKET:          'ticket:join',
  LEAVE_TICKET:         'ticket:leave',
};
