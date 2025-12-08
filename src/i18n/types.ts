// i18n Type Definitions
// All translation keys are defined here for type safety

export interface Translations {
  common: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    create: string;
    close: string;
    loading: string;
    search: string;
    filter: string;
    all: string;
    yes: string;
    no: string;
    confirm: string;
    back: string;
    next: string;
    previous: string;
    submit: string;
    download: string;
    copy: string;
    copied: string;
    clear: string;
    reset: string;
    view: string;
    viewAll: string;
    noResults: string;
    user: string;
    poweredBy: string;
  };
  
  header: {
    login: string;
    signup: string;
    logout: string;
    dashboard: string;
    myProfile: string;
    examples: string;
    exercises: string;
    saveAs: string;
    newProgram: string;
    unsavedChanges: string;
  };
  
  editor: {
    sourceCode: string;
    load: string;
    run: string;
    pause: string;
    step: string;
    reset: string;
    loadProgram: string;
    programLoaded: string;
    loadProgramFirst: string;
    executionPaused: string;
    executionRunning: string;
    programTerminated: string;
    resetComplete: string;
    compilationError: string;
    runtimeError: string;
    infiniteLoopDetected: string;
    executionInProgress: string;
    stopAndLoad: string;
  };
  
  cpu: {
    status: string;
    architecture: string;
    generalRegisters: string;
    specialRegisters: string;
    flags: string;
  };
  
  memory: {
    title: string;
    memoryInfo: string;
    memoryDescription: string;
    stackInfo: string;
    stackDescription: string;
    pushDescription: string;
    popDescription: string;
    stackEmpty: string;
    stackFull: string;
    example: string;
    data: string;
    stack: string;
    topSP: string;
    topOfStack: string;
  };
  
  output: {
    logOutput: string;
    noOutput: string;
    outputWillAppear: string;
    copyLog: string;
    clearLog: string;
    logCopied: string;
    logCleared: string;
    runtimeError: string;
    output: string;
    errors: string;
  };
  
  examples: {
    title: string;
    codeExamples: string;
    examplesCount: string;
    loadIntoSimulator: string;
    loaded: string;
    codePreview: string;
    useArrows: string;
    exampleLoaded: string;
    // Example titles and descriptions
    factorial: {
      title: string;
      description: string;
    };
    stackDemo: {
      title: string;
      description: string;
    };
    subroutine: {
      title: string;
      description: string;
    };
    signCheck: {
      title: string;
      description: string;
    };
  };
  
  exercises: {
    title: string;
    exercises: string;
    exerciseCount: string;
    startExercise: string;
    exerciseLoaded: string;
    assignment: string;
    requirements: string;
    expectedOutput: string;
    noExercisesFound: string;
    completed: string;
    difficulty: {
      all: string;
      beginner: string;
      intermediate: string;
      advanced: string;
      expert: string;
      impossible: string;
    };
    categories: {
      arithmetic: string;
      memory: string;
      subroutine: string;
      control: string;
    };
  };
  
  auth: {
    login: string;
    signup: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    confirmPassword: string;
    loggingIn: string;
    signingUp: string;
    loginSuccess: string;
    signupSuccess: string;
    logoutSuccess: string;
    invalidCredentials: string;
    confirmEmail: string;
    orContinueWith: string;
    continueWithGoogle: string;
    alreadyHaveAccount: string;
    dontHaveAccount: string;
    simulatorSubtitle: string;
    redirecting: string;
    enablePopups: string;
    features: {
      simulate: string;
      visualize: string;
      exercises: string;
      saveShare: string;
    };
    validation: {
      emailInvalid: string;
      passwordMin: string;
      passwordsMatch: string;
      firstNameMin: string;
      lastNameMin: string;
    };
  };
  
  dashboard: {
    welcome: string;
    manageClasses: string;
    continueLearning: string;
    savedPrograms: string;
    yourPrograms: string;
    managedClasses: string;
    enrolledClasses: string;
    activeClasses: string;
    followedClasses: string;
    createdAssignments: string;
    assignments: string;
    totalAssignments: string;
    toComplete: string;
    availableExercises: string;
    inRepository: string;
    quickActions: string;
    newProgram: string;
    startWritingCode: string;
    openEditor: string;
    exploreExercises: string;
    viewExercises: string;
    createClass: string;
    addNewClass: string;
    promoteStudent: string;
    promoteToTeacher: string;
    viewAssignments: string;
    recentPrograms: string;
    latestSavedPrograms: string;
    noSavedPrograms: string;
    startProgramming: string;
    recentAssignments: string;
    upcomingDeadlines: string;
    latestCreatedAssignments: string;
    assignmentsToComplete: string;
    deadline: string;
  };
  
  sidebar: {
    simulator: string;
    myPrograms: string;
    myClasses: string;
    exerciseRepository: string;
    userManagement: string;
  };
  
  programs: {
    myPrograms: string;
    newFolder: string;
    gridView: string;
    treeView: string;
    rename: string;
    move: string;
    share: string;
    delete: string;
    copyLink: string;
    publicLink: string;
    makePublic: string;
    makePrivate: string;
    openInSimulator: string;
    noPrograms: string;
    createFirst: string;
    programDeleted: string;
    programRenamed: string;
    programMoved: string;
    linkCopied: string;
    confirmDelete: string;
  };
  
  classes: {
    myClasses: string;
    className: string;
    description: string;
    academicYear: string;
    students: string;
    student: string;
    teachers: string;
    teacher: string;
    coTeachers: string;
    addStudent: string;
    addCoTeacher: string;
    removeStudent: string;
    removeTeacher: string;
    noClasses: string;
    createFirstClass: string;
    alreadyInClass: string;
    studentsSelected: string;
    classCreated: string;
    classUpdated: string;
    classDeleted: string;
    studentAdded: string;
    studentRemoved: string;
    archived: string;
  };
  
  assignments: {
    exercises: string;
    dueDate: string;
    status: string;
    submitted: string;
    notSubmitted: string;
    graded: string;
    grade: string;
    maxPoints: string;
    feedback: string;
    submitCode: string;
    editSubmission: string;
    viewCode: string;
    markAsFinal: string;
    autoGrade: string;
    manualGrade: string;
    submissionNumber: string;
    newSubmission: string;
    loadFromSaved: string;
    openInSimulator: string;
    noSubmissions: string;
    totalPoints: string;
    required: string;
    optional: string;
  };
  
  users: {
    allUsers: string;
    students: string;
    teachers: string;
    promote: string;
    revoke: string;
    deleteUser: string;
    userDetails: string;
    registeredOn: string;
    roles: string;
    superAdmin: string;
    noUsersFound: string;
    userPromoted: string;
    teacherRevoked: string;
    userDeleted: string;
  };
  
  profile: {
    myProfile: string;
    personalInfo: string;
    updateProfile: string;
    profileUpdated: string;
    emailNotEditable: string;
  };
  
  dialogs: {
    saveProgram: string;
    programName: string;
    programDescription: string;
    linesOfCode: string;
    createFolder: string;
    folderName: string;
    selectFolder: string;
    rootFolder: string;
    moveToFolder: string;
    renameTo: string;
    gradeSubmission: string;
    addFeedback: string;
    // Class dialogs
    createClass: string;
    editClass: string;
    enterClassDetails: string;
    classNamePlaceholder: string;
    descriptionPlaceholder: string;
    consecutiveYears: string;
    creating: string;
    saving: string;
    // Student/Teacher dialogs
    addStudentsToClass: string;
    addCoTeachersToClass: string;
    selectOneOrMore: string;
    searchByNameEmail: string;
    loadingStudents: string;
    loadingTeachers: string;
    noStudentFound: string;
    noTeacherFound: string;
    noStudentRegistered: string;
    noTeacherRegistered: string;
    selectAll: string;
    deselectAll: string;
    available: string;
    selected: string;
    adding: string;
    addStudents: string;
    addCoTeachers: string;
    studentsAdded: string;
    coTeachersAdded: string;
    selectAtLeastOne: string;
    // Assignment dialogs
    createAssignment: string;
    editAssignment: string;
    newMultiExercise: string;
    updateExercises: string;
    title: string;
    description: string;
    class: string;
    selectClass: string;
    dueDateOptional: string;
    lateSubmissions: string;
    solutionAfterDeadline: string;
    assignedExercises: string;
    noExerciseSelected: string;
    searchAddExercises: string;
    searchByTitleCategory: string;
    noExerciseFound: string;
    points: string;
    createAssignmentBtn: string;
    hasSubmissions: string;
    cannotChangeClass: string;
    assignmentUpdated: string;
    assignmentCreated: string;
    // Grade dialog
    gradeStudent: string;
    studentLabel: string;
    gradeOutOf: string;
    feedbackPlaceholder: string;
    savingGrade: string;
    saveGrade: string;
    gradeSuccess: string;
    // View code dialog
    viewCodeTitle: string;
    copyCode: string;
    openInSimulator: string;
    submission: string;
    codeCopied: string;
    codeLoadedInSimulator: string;
  };
  
  theme: {
    toggle: string;
    light: string;
    dark: string;
  };
  
  language: {
    toggle: string;
    italian: string;
    english: string;
  };
  
  github: {
    viewOnGithub: string;
    repository: string;
  };
  
  footer: {
    copyright: string;
  };
  
  documentation: {
    title: string;
    guide: string;
  };
  
  toasts: {
    success: string;
    error: string;
    info: string;
    warning: string;
  };
}

export type Language = 'it' | 'en';

export interface LanguageOption {
  code: Language;
  name: string;
  flag: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
];
