namespace BikeMechanic.Api.Entities;

public enum UserRole
{
    Mechanic,
    Client
}

public enum ServiceStatus
{
    New,
    InProgress,
    Completed
}

public enum SparePartAction
{
    Inspected,
    Reused,
    Replaced,
    Added,
    Removed
}

public enum InvoiceItemCategory
{
    Labour,
    SparePart,
    Other
}

public enum FollowUpType
{
    GeneralService,
    EngineOil,
    BrakeCheck,
    TyreCheck,
    Custom
}

public enum FollowUpStatus
{
    Pending,
    Completed,
    Cancelled
}

public enum NotificationType
{
    ServiceCompleted,
    InvoiceCreated,
    FollowUpReminder,
    GeneralNotification
}
