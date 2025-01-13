export const translations = {
  en: {
    // General
    title: "Scrum Poker",
    room: "Room",
    share: "Share Room",
    shareDescription: "Share this QR code or room code with others",
    roomCode: "Room Code",
    roomUrl: "Room URL",
    copy: "Copy",
    createOrJoin: "Create or join a room to start estimating",
    createRoom: "Create Room",
    createRoomDescription: "Enter a name for your planning poker room",
    roomName: "Room Name",
    enterRoomName: "Enter room name",
    creating: "Creating...",
    joinRoomDescription: "Enter the room code to join",
    enterRoomCode: "Enter room code",
    // Actions
    revealCards: "Reveal Cards",
    hideCards: "Hide Cards",
    newVote: "New Vote",
    moveToObservers: "Move to Observers",
    editVote: "Edit vote",
    
    // Statistics
    results: "Results",
    mostVoted: "Most Voted",
    average: "Average",
    distribution: "Vote Distribution",
    votes: "votes",
    
    // Seats
    emptySeat: "Empty Seat",
    ready: "Ready",
    alreadyHasSeat: "You already have a seat",
    
    // Instructions
    clickSeatToJoin: "Click an empty seat to join the table",
    votingInstructions: "Select a card to vote • Wait for all participants • Reveal cards together",
    
    // Join Dialog
    enterName: "Enter your name",
    yourName: "Your name",
    joinButton: "Join Room",
    joinRoom: "Join Room",
    observers: "Observers",
    observing: "Observing",
    noObservers: "No observers",
    // Settings
    settings: "Settings",
    changeName: "Change Name",
    changeNameDescription: "Enter your new display name",
    save: "Save",
  },
  ru: {
    // Общие
    title: "Scrum Poker",
    room: "Комната",
    share: "Поделиться",
    shareDescription: "Поделитесь этим QR-кодом или кодом комнаты",
    roomCode: "Код комнаты",
    roomUrl: "URL комнаты",
    copy: "Копировать",
    createOrJoin: "Создайте или присоединитесь к комнате для начала оценки",
    createRoom: "Создать комнату",
    createRoomDescription: "Введите название для вашей комнаты покера планирования",
    roomName: "Название комнаты",
    enterRoomName: "Введите название комнаты",
    creating: "Создание...",
    joinRoomDescription: "Введите код комнаты для присоединения",
    enterRoomCode: "Введите код комнаты",
    // Действия
    revealCards: "Показать карты",
    hideCards: "Скрыть карты",
    newVote: "Новое голосование",
    moveToObservers: "+",
    editVote: "Изменить голос",
    
    // Статистика
    results: "Результаты",
    mostVoted: "Популярное значение",
    average: "Среднее",
    distribution: "Распределение голосов",
    votes: "голосов",
    
    // Места
    emptySeat: "Свободное место",
    ready: "Готов",
    alreadyHasSeat: "У вас уже есть место",
    
    // Инструкции
    clickSeatToJoin: "Нажмите на свободное место, чтобы присоединиться",
    votingInstructions: "Выберите карту • Дождитесь всех участников • Покажите карты вместе",
    
    // Диалог входа
    enterName: "Введите ваше имя",
    yourName: "Ваше имя",
    joinButton: "Присоединиться",
    joinRoom: "Присоединиться",
    observers: "Наблюдатели",
    observing: "Наблюдает",
    noObservers: "Нет наблюдателей",
    // Settings
    settings: "Настройки",
    changeName: "Изменить имя",
    changeNameDescription: "Введите новое отображаемое имя",
    save: "Сохранить",
  }
}

export type Language = keyof typeof translations
export type TranslationKey = keyof typeof translations.en

