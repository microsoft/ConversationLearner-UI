// Message ids follow convention of '<componentname>.<area>[.<subarea>]*`
export default {
    'en-US': {
        'About.title': 'About',
        'Docs.title': 'Docs',
        'Support.title': 'Support',
        'NoMatch.title': 'That page was not found.',
        'NoMatch.home': 'Home',
        'page.comingsoon': 'Coming soon...',
        // App
        'App.header.home': 'Home',
        'App.header.about': 'About',
        'App.header.docs': 'Docs',
        'App.header.support': 'Support',
        // Apps List
        'AppsList.title': 'My Apps',
        'AppsList.subtitle': 'Create and Manage your BLIS applications...',
        'AppsList.createButtonAriaDescription': 'Create a New Application',
        'AppsList.createButtonText': 'New App',
        'AppsList.confirmDeleteModalTitle': 'Are you sure you want to delete this application?',
        'AppsList.columns.name': 'Name',
        'AppsList.columns.locale': 'Locale',
        'AppsList.columns.linkedBots': 'Linked Bots',
        'AppsList.columns.actions': 'Actions',
        // Actions
        'Actions.title': 'Actions',
        'Actions.subtitle': `Manage a list of actions that your application can take given it's state and user input...`,
        'Actions.createButtonAriaDescription': 'Create a New Action',
        'Actions.createButtonTitle': 'New Action',
        'Actions.confirmDeleteModalTitle': 'Are you sure you want to delete this action?',
        // Dashboard
        'Dashboard.title': 'Overview',
        'Dashboard.subtitle': `Facts & statistics about the app's data at any period of time...`,
        // Entities
        'Entities.title': 'Entities',
        'Entities.subtitle': 'Manage a list of entities in your application and track and control their instances within actions...',
        'Entities.createButtonAriaDescription': 'Create a New Entity',
        'Entities.createButtonText': 'New Entity',
        'Entities.columns.name': 'Name',
        'Entities.columns.type': 'Type',
        'Entities.columns.isProgrammatic': 'Programmatic',
        'Entities.columns.isBucketable': 'Multi-Value',
        'Entities.columns.isNegatable': 'Negatable',
        'Entities.confirmDeleteModalTitle': 'Are you sure you want to delete this entity?',
        'Entities.deleteWarningTitle': 'You cannot delete this entity because it is being used in an action.',
        'Entities.deleteWarningPrimaryButtonText': 'Close',
        // Modals
        // Login
        'UserLogin.title': 'Log In',
        'UserLogin.usernameFieldLabel': 'Name',
        'UserLogin.usernameFieldPlaceholder': 'User Name...',
        'UserLogin.passwordFieldLabel': 'Password',
        'UserLogin.passwordFieldPlaceholder': 'Password...',
        'UserLogin.loginButtonAriaDescription': 'Log In',
        'UserLogin.loginButtonText': 'Log In',
    },
    'ko': {
        'About.title': '약',
        'Docs.title': '선적 서류 비치',
        'Support.title': '지원하다',
        'NoMatch.title': '페이지를 찾을 수 없습니다.',
        'NoMatch.home': '집',
        'page.comingsoon': '출시 예정 ...',
        // App
        'App.header.home': '집',
        'App.header.about': '약',
        'App.header.docs': '선적 서류 비치',
        'App.header.support': '지원하다',
        'AppsList.confirmDeleteModalTitle': '이 애플리케이션을 삭제 하시겠습니까?',
        'AppsList.columns.name': '이름',
        'AppsList.columns.locale': '장소',
        'AppsList.columns.linkedBots': '연결된 봇',
        'AppsList.columns.actions': '행위',
         // Apps List
         'AppsList.title': '내 앱',
         'AppsList.subtitle': 'BLIS 응용 프로그램 작성 및 관리 ...',
         'AppsList.createButtonAriaDescription': '새 응용 프로그램 만들기',
         'AppsList.createButtonText': '새 앱',
        // Modals
        // Login
        'UserLogin.title': '로그인',
        'UserLogin.usernameFieldLabel': '이름',
        'UserLogin.usernameFieldPlaceholder': '사용자 이름...',
        'UserLogin.passwordFieldLabel': '암호',
        'UserLogin.passwordFieldPlaceholder': '암호...',
        'UserLogin.loginButtonAriaDescription': '로그인',
        'UserLogin.loginButtonText': '로그인',

        // TODO: I think there are special localization experts within Microsoft who can fill this in for us.
    }
}