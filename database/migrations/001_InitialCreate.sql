IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260921091900_InitialCreate'
)
BEGIN
    CREATE TABLE [SpareParts] (
        [Id] int NOT NULL IDENTITY,
        [Name] nvarchar(150) NOT NULL,
        [Brand] nvarchar(max) NULL,
        [PartNumber] nvarchar(max) NULL,
        [DefaultPrice] decimal(10,2) NOT NULL,
        [Description] nvarchar(max) NULL,
        [IsActive] bit NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_SpareParts] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260921091900_InitialCreate'
)
BEGIN
    CREATE TABLE [Users] (
        [Id] int NOT NULL IDENTITY,
        [Name] nvarchar(150) NOT NULL,
        [Phone] nvarchar(20) NOT NULL,
        [Email] nvarchar(150) NULL,
        [PasswordHash] nvarchar(max) NOT NULL,
        [Role] nvarchar(20) NOT NULL,
        [IsActive] bit NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_Users] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260921091900_InitialCreate'
)
BEGIN
    CREATE TABLE [Clients] (
        [Id] int NOT NULL IDENTITY,
        [UserId] int NOT NULL,
        [Name] nvarchar(150) NOT NULL,
        [Phone] nvarchar(20) NOT NULL,
        [Email] nvarchar(max) NULL,
        [Address] nvarchar(max) NULL,
        [Notes] nvarchar(max) NULL,
        [IsActive] bit NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_Clients] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Clients_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260921091900_InitialCreate'
)
BEGIN
    CREATE TABLE [RefreshTokens] (
        [Id] int NOT NULL IDENTITY,
        [UserId] int NOT NULL,
        [TokenHash] nvarchar(450) NOT NULL,
        [ExpiresAt] datetime2 NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [RevokedAt] datetime2 NULL,
        CONSTRAINT [PK_RefreshTokens] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_RefreshTokens_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260921091900_InitialCreate'
)
BEGIN
    CREATE TABLE [Bikes] (
        [Id] int NOT NULL IDENTITY,
        [ClientId] int NOT NULL,
        [RegistrationNumber] nvarchar(30) NOT NULL,
        [Brand] nvarchar(80) NOT NULL,
        [Model] nvarchar(80) NOT NULL,
        [Variant] nvarchar(max) NULL,
        [ManufacturingYear] int NULL,
        [Colour] nvarchar(max) NULL,
        [CurrentOdometer] int NOT NULL,
        [PurchaseDate] datetime2 NULL,
        [PhotoUrl] nvarchar(max) NULL,
        [Notes] nvarchar(max) NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_Bikes] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Bikes_Clients_ClientId] FOREIGN KEY ([ClientId]) REFERENCES [Clients] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260921091900_InitialCreate'
)
BEGIN
    CREATE TABLE [Notifications] (
        [Id] int NOT NULL IDENTITY,
        [ClientId] int NOT NULL,
        [Title] nvarchar(max) NOT NULL,
        [Message] nvarchar(max) NOT NULL,
        [Type] nvarchar(30) NOT NULL,
        [ReferenceId] int NULL,
        [IsRead] bit NOT NULL,
        [SentAt] datetime2 NULL,
        [CreatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_Notifications] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Notifications_Clients_ClientId] FOREIGN KEY ([ClientId]) REFERENCES [Clients] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260921091900_InitialCreate'
)
BEGIN
    CREATE TABLE [Services] (
        [Id] int NOT NULL IDENTITY,
        [BikeId] int NOT NULL,
        [MechanicId] int NOT NULL,
        [ServiceDate] datetime2 NOT NULL,
        [Odometer] int NOT NULL,
        [Complaint] nvarchar(max) NULL,
        [InspectionNotes] nvarchar(max) NULL,
        [WorkPerformed] nvarchar(max) NULL,
        [LabourAmount] decimal(10,2) NOT NULL,
        [Status] nvarchar(20) NOT NULL,
        [Notes] nvarchar(max) NULL,
        [CreatedAt] datetime2 NOT NULL,
        [CompletedAt] datetime2 NULL,
        CONSTRAINT [PK_Services] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Services_Bikes_BikeId] FOREIGN KEY ([BikeId]) REFERENCES [Bikes] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_Services_Users_MechanicId] FOREIGN KEY ([MechanicId]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260921091900_InitialCreate'
)
BEGIN
    CREATE TABLE [FollowUps] (
        [Id] int NOT NULL IDENTITY,
        [ClientId] int NOT NULL,
        [BikeId] int NOT NULL,
        [ServiceId] int NOT NULL,
        [FollowUpDate] datetime2 NOT NULL,
        [FollowUpType] nvarchar(30) NOT NULL,
        [Notes] nvarchar(max) NULL,
        [Status] nvarchar(20) NOT NULL,
        [NotificationSent] bit NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [CompletedAt] datetime2 NULL,
        CONSTRAINT [PK_FollowUps] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_FollowUps_Bikes_BikeId] FOREIGN KEY ([BikeId]) REFERENCES [Bikes] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_FollowUps_Clients_ClientId] FOREIGN KEY ([ClientId]) REFERENCES [Clients] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_FollowUps_Services_ServiceId] FOREIGN KEY ([ServiceId]) REFERENCES [Services] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260921091900_InitialCreate'
)
BEGIN
    CREATE TABLE [Invoices] (
        [Id] int NOT NULL IDENTITY,
        [InvoiceNumber] nvarchar(450) NOT NULL,
        [ServiceId] int NOT NULL,
        [ClientId] int NOT NULL,
        [BikeId] int NOT NULL,
        [InvoiceDate] datetime2 NOT NULL,
        [LabourAmount] decimal(10,2) NOT NULL,
        [SparePartsAmount] decimal(10,2) NOT NULL,
        [Discount] decimal(10,2) NOT NULL,
        [Tax] decimal(10,2) NOT NULL,
        [TotalAmount] decimal(10,2) NOT NULL,
        [Notes] nvarchar(max) NULL,
        [PdfUrl] nvarchar(max) NULL,
        [IsVoided] bit NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_Invoices] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Invoices_Bikes_BikeId] FOREIGN KEY ([BikeId]) REFERENCES [Bikes] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Invoices_Clients_ClientId] FOREIGN KEY ([ClientId]) REFERENCES [Clients] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Invoices_Services_ServiceId] FOREIGN KEY ([ServiceId]) REFERENCES [Services] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260921091900_InitialCreate'
)
BEGIN
    CREATE TABLE [ServiceParts] (
        [Id] int NOT NULL IDENTITY,
        [ServiceId] int NOT NULL,
        [SparePartId] int NOT NULL,
        [Quantity] int NOT NULL,
        [UnitPrice] decimal(10,2) NOT NULL,
        [TotalPrice] decimal(10,2) NOT NULL,
        [Action] nvarchar(20) NOT NULL,
        [OldPartDescription] nvarchar(max) NULL,
        [NewPartDescription] nvarchar(max) NULL,
        [Notes] nvarchar(max) NULL,
        [CreatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_ServiceParts] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_ServiceParts_Services_ServiceId] FOREIGN KEY ([ServiceId]) REFERENCES [Services] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_ServiceParts_SpareParts_SparePartId] FOREIGN KEY ([SparePartId]) REFERENCES [SpareParts] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260921091900_InitialCreate'
)
BEGIN
    CREATE TABLE [InvoiceItems] (
        [Id] int NOT NULL IDENTITY,
        [InvoiceId] int NOT NULL,
        [Description] nvarchar(max) NOT NULL,
        [Category] nvarchar(20) NOT NULL,
        [Quantity] int NOT NULL,
        [UnitPrice] decimal(10,2) NOT NULL,
        [Amount] decimal(10,2) NOT NULL,
        CONSTRAINT [PK_InvoiceItems] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_InvoiceItems_Invoices_InvoiceId] FOREIGN KEY ([InvoiceId]) REFERENCES [Invoices] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260921091900_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Bikes_ClientId] ON [Bikes] ([ClientId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260921091900_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Bikes_RegistrationNumber] ON [Bikes] ([RegistrationNumber]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260921091900_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Clients_UserId] ON [Clients] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260921091900_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_FollowUps_BikeId] ON [FollowUps] ([BikeId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260921091900_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_FollowUps_ClientId] ON [FollowUps] ([ClientId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260921091900_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_FollowUps_ServiceId] ON [FollowUps] ([ServiceId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260921091900_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_InvoiceItems_InvoiceId] ON [InvoiceItems] ([InvoiceId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260921091900_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Invoices_BikeId] ON [Invoices] ([BikeId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260921091900_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Invoices_ClientId] ON [Invoices] ([ClientId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260921091900_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Invoices_InvoiceNumber] ON [Invoices] ([InvoiceNumber]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260921091900_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Invoices_ServiceId] ON [Invoices] ([ServiceId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260921091900_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Notifications_ClientId] ON [Notifications] ([ClientId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260921091900_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_RefreshTokens_TokenHash] ON [RefreshTokens] ([TokenHash]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260921091900_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_RefreshTokens_UserId] ON [RefreshTokens] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260921091900_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_ServiceParts_ServiceId] ON [ServiceParts] ([ServiceId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260921091900_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_ServiceParts_SparePartId] ON [ServiceParts] ([SparePartId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260921091900_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Services_BikeId] ON [Services] ([BikeId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260921091900_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Services_MechanicId] ON [Services] ([MechanicId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260921091900_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Users_Phone] ON [Users] ([Phone]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260921091900_InitialCreate'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260921091900_InitialCreate', N'10.0.12');
END;

COMMIT;
GO

