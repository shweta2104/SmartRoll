import { useState, useEffect, useCallback, useRef } from 'react';

export const ROLES = {
    ADMIN: 'ADMIN',
    TEACHER: 'TEACHER',
    STUDENT: 'STUDENT',
    NONE: 'NONE'
};

const ROLE_PREFIXES = {
    [ROLES.ADMIN]: 'admin-',
    [ROLES.TEACHER]: 'teacher-',
    [ROLES.STUDENT]: 'student-'
};

// Generate unique session ID for this tab
const getTabSessionId = () => {
    const key = 'tab-session-id';
    let sessionId = sessionStorage.getItem(key);
    if (!sessionId) {
        sessionId = 'tab-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        sessionStorage.setItem(key, sessionId);
    }
    return sessionId;
};

const getTabStorageKey = (key) => {
    return `${getTabSessionId()}::${key}`;
};

export const setTabItem = (key, value) => {
    const tabKey = getTabStorageKey(key);
    sessionStorage.setItem(tabKey, value);
};

export const getTabItem = (key) => {
    const tabKey = getTabStorageKey(key);
    return sessionStorage.getItem(tabKey);
};

export const useAuth = () => {
    const tabSessionIdRef = useRef(getTabSessionId());
    const [activeRole, setActiveRoleState] = useState(
        sessionStorage.getItem(getTabStorageKey('activeRole')) ||
        ROLES.NONE
    );
    const [token, setTokenState] = useState(
        sessionStorage.getItem(getTabStorageKey('token'))
    );
    const [userId, setUserIdState] = useState(
        sessionStorage.getItem(getTabStorageKey('userId'))
    );

    const getStoredValue = useCallback((key) => {
        if (activeRole === ROLES.NONE) return null;
        const prefix = ROLE_PREFIXES[activeRole];
        const sessionKey = getTabStorageKey(prefix + key);
        return sessionStorage.getItem(sessionKey);
    }, [activeRole]);

    const setActiveRole = useCallback((role) => {
        if (!ROLES[role]) return;
        const tabKey = getTabStorageKey('activeRole');
        sessionStorage.setItem(tabKey, role);
        setActiveRoleState(role);

        const prefix = ROLE_PREFIXES[role];
        const roleTokenKey = getTabStorageKey(prefix + 'token');
        const roleUserIdKey = getTabStorageKey(prefix + 'userId');
        const roleUserEmailKey = getTabStorageKey(prefix + 'userEmail');

        const roleToken = sessionStorage.getItem(roleTokenKey);
        const roleUserId = sessionStorage.getItem(roleUserIdKey);
        const roleUserEmail = sessionStorage.getItem(roleUserEmailKey);

        if (roleToken) {
            sessionStorage.setItem(getTabStorageKey('token'), roleToken);
            setTokenState(roleToken);
        }
        if (roleUserId) {
            sessionStorage.setItem(getTabStorageKey('userId'), roleUserId);
            setUserIdState(roleUserId);
        }
        if (roleUserEmail) {
            sessionStorage.setItem(getTabStorageKey('userEmail'), roleUserEmail);
        }
    }, []);

    const logoutRole = useCallback((role) => {
        if (!ROLES[role]) return;
        const prefix = ROLE_PREFIXES[role];
        ['token', 'userId', 'role', 'userRole', 'userEmail'].forEach((key) => {
            const tabKey = getTabStorageKey(prefix + key);
            sessionStorage.removeItem(tabKey);
        });

        if (activeRole === role) {
            const tabActiveRoleKey = getTabStorageKey('activeRole');
            const tabTokenKey = getTabStorageKey('token');
            const tabUserIdKey = getTabStorageKey('userId');
            const tabUserRoleKey = getTabStorageKey('userRole');
            const tabUserEmailKey = getTabStorageKey('userEmail');

            sessionStorage.removeItem(tabActiveRoleKey);
            sessionStorage.removeItem(tabTokenKey);
            sessionStorage.removeItem(tabUserIdKey);
            sessionStorage.removeItem(tabUserRoleKey);
            sessionStorage.removeItem(tabUserEmailKey);

            setActiveRoleState(ROLES.NONE);
            setTokenState(null);
            setUserIdState(null);
        }
    }, [activeRole]);

    const getAuthHeaders = useCallback(() => {
        return token ? { Authorization: `Bearer ${token}` } : {};
    }, [token]);

    const isAuthenticated = activeRole !== ROLES.NONE && !!token;

    useEffect(() => {
        const roleStudent = ROLES.STUDENT;
        if (activeRole !== roleStudent) return;

        const studentTokenKey = getTabStorageKey(ROLE_PREFIXES[roleStudent] + 'token');
        const studentUserIdKey = getTabStorageKey(ROLE_PREFIXES[roleStudent] + 'userId');

        const roleToken = sessionStorage.getItem(studentTokenKey);
        if (!roleToken) {
            const sharedToken = sessionStorage.getItem(getTabStorageKey('token'));
            if (sharedToken) {
                sessionStorage.setItem(studentTokenKey, sharedToken);
                setTokenState(sharedToken);
            }
        }

        const roleUserId = sessionStorage.getItem(studentUserIdKey);
        if (!roleUserId) {
            const sharedUserId = sessionStorage.getItem(getTabStorageKey('userId'));
            if (sharedUserId) {
                sessionStorage.setItem(studentUserIdKey, sharedUserId);
                setUserIdState(sharedUserId);
            }
        }
    }, [activeRole]);

    useEffect(() => {
        const handleStorageChange = () => {
            const tabKey = getTabStorageKey('activeRole');
            const newActiveRole = sessionStorage.getItem(tabKey);
            const tabTokenKey = getTabStorageKey('token');
            const newToken = sessionStorage.getItem(tabTokenKey);

            if (newActiveRole !== activeRole) {
                setActiveRoleState(newActiveRole || ROLES.NONE);
            }
            if (newToken !== token) {
                setTokenState(newToken);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [activeRole, token]);

    return {
        activeRole,
        token,
        userId,
        userEmail: getStoredValue('userEmail'),
        userRole: getStoredValue('role'),
        isAuthenticated,
        setActiveRole,
        logoutRole,
        getAuthHeaders,
        ROLES
    };
};

export default useAuth;


