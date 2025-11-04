# Task Manager API

> Для написания тестов и документации использовался ИИ

Сервис для управления задачами, построенный с использованием Clean Architecture и Domain-Driven Design принципов.

## Технологический стек

-   **Runtime**: Bun.js
-   **Фреймворк**: Elysia.js
-   **База данных**: PostgreSQL с Prisma ORM
-   **Кэширование/Очереди**: Redis
-   **Контейнеризация**: Docker
-   **Тестирование**: Bun Test

## Архитектура

Проект следует принципам Clean Architecture с четким разделением на слои:

### Domain Layer (`src/domain/`)

-   **Entities**: Бизнес-сущности (Task)
-   **Value Objects**: Объекты-значения (DueDate)
-   **Domain Errors**: Доменные ошибки
-   **Repository Interfaces**: Интерфейсы репозиториев

### Application Layer (`src/application/`)

-   **Services**: Application Services (TaskService)
-   **DTO**: Объекты передачи данных
-   **Application Errors**: Ошибки уровня приложения

### Infrastructure Layer (`src/infrastructure/`)

-   **Repositories**: Реализация репозиториев
-   **Web**: HTTP сервер и маршруты
-   **ORM**: Работа с базой данных
-   **Queue**: Реализация очереди уведомлений
-   **Config**: Конфигурация приложения

## API Эндпоинты

### Задачи

-   `POST /tasks` - Создание задачи
-   `GET /tasks` - Получение списка задач (с фильтрацией по статусу)
-   `GET /tasks/:id` - Получение задачи по ID
-   `PUT /tasks/:id` - Обновление задачи
-   `DELETE /tasks/:id` - Удаление задачи

### Health Check

-   `GET /health` - Проверка состояния сервиса

## Запуск проекта

### Локальная разработка

1. Установите зависимости:

```bash
bun install
```

2. Запустите базы данных через Docker:

```bash
cd docker
docker-compose up -d
```

3. Сгенерируйте Prisma клиент:

```bash
bunx prisma generate
```

4. Выполните миграции:

```bash
bunx prisma migrate dev
```

5. Запустите приложение:

```bash
bun run dev
```

6. Запустите worker для обработки уведомлений (в отдельном терминале):

```bash
bun run worker
```

### Через Docker

Полный запуск всех сервисов:

```bash
cd docker
docker-compose up --build
```

## Тестирование

Запуск всех тестов:

```bash
bun test
```

Запуск тестов в режиме watch:

```bash
bun run test:watch
```

### Структура тестов

-   `tests/unit/domain/` - Unit тесты доменного слоя
-   `tests/unit/application/` - Unit тесты слоя приложения (с моками)
-   `tests/unit/queue/` - Unit тесты очереди уведомлений
-   `tests/integration/` - Интеграционные тесты (реальные зависимости, без внешних систем)
-   `tests/e2e/` - End-to-end тесты (полный стек)
-   `tests/mocks/` - Мок-объекты для тестирования

## Асинхронные уведомления

При создании или обновлении задачи с датой выполнения в течение 24 часов, система автоматически отправляет уведомление через Redis очередь. Worker обрабатывает эти уведомления и записывает их в лог-файл `notifications.log`.

## Переменные окружения

Создайте файл `.env` на основе `.env.example`:

```env
DATABASE_URL=postgresql://user:secret@localhost:5432/tasks
REDIS_URL=redis://localhost:6379
PORT=3000
```

## Структура проекта

```
src/
├── domain/                 # Доменный слой
│   ├── entities/          # Сущности
│   ├── value-objects/     # Объекты-значения
│   ├── errors/           # Доменные ошибки
│   └── repositories/     # Интерфейсы репозиториев
├── application/           # Слой приложения
│   ├── services/         # Application Services
│   ├── dto/             # Объекты передачи данных
│   ├── errors/          # Ошибки приложения
│   └── interfaces/      # Интерфейсы
├── infrastructure/        # Инфраструктурный слой
│   ├── repositories/     # Реализация репозиториев
│   ├── web/            # HTTP сервер
│   ├── orm/            # Работа с БД
│   ├── queue/          # Очередь уведомлений
│   ├── config/         # Конфигурация
│   └── bootstrap.ts    # Инициализация сервисов
└── index.ts            # Точка входа

tests/                   # Тесты
docker/                  # Docker конфигурации
prisma/                  # Prisma схема и миграции
```

## Особенности реализации

-   **Чистая архитектура**: Четкое разделение ответственности
-   **DDD**: Правильное использование доменных концепций
-   **Валидация**: Многоуровневая валидация данных
-   **Обработка ошибок**: Централизованная обработка ошибок
-   **Асинхронность**: Неблокирующая обработка уведомлений
-   **Тестирование**: Комплексное покрытие всех слоев
