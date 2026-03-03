import axios from '../utils/axiosCustomize';

// ===== AUTH =====
export const login = (code: string, password: string) => {
  return axios.post('/auth/login', { code, password }, { withCredentials: true });
};

export const logout = () => {
  return axios.post('/auth/logout', {}, { withCredentials: true });
};

export const refreshToken = () => {
  return axios.post('/auth/refresh-token', {}, { withCredentials: true });
};

// ===== USERS =====
export const getAllUsersWithPaginate = (role?: string, search?: string, page?: number, pageSize?: number) => {
  const query = new URLSearchParams();
  if (role) query.append('role', role);
  if (search) query.append('search', search);
  if (page) query.append('page', String(page));
  if (pageSize) query.append('pageSize', String(pageSize));
  const qs = query.toString();
  return axios.get(`/users/paginate${qs ? `?${qs}` : ''}`);
};

export const getAllUsers = () => {
  return axios.get('/users');
};

export const createUser = (fullName: string, role: string) => {
  return axios.post('/users', { fullName, role });
};

export const updateUser = (id: number, fullName?: string, role?: string) => {
  return axios.patch(`/users/${id}`, { fullName, role });
};

export const updateUserStatus = (id: number, status: string) => {
  return axios.patch(`/users/${id}/status`, { status });
};

export const resetPasswordForAdmin = (id: number, newPassword: string) => {
  return axios.patch(`/users/${id}/reset-password`, { newPassword });
};

export const changePassword = (id: number, oldPassword: string, newPassword: string) => {
  return axios.patch(`/users/${id}/change-password`, { oldPassword, newPassword });
};

export const getStudentsByClass = (classID: number) => {
  return axios.get('/users/students', { params: { classID } });
};

export const getAllTeachers = () => {
  return axios.get('/users/teachers');
};

// ===== CLASSES =====
export const getAllClasses = (search?: string, page?: number, pageSize?: number) => {
  const query = new URLSearchParams();
  if (search) query.append('search', search);
  if (page) query.append('page', String(page));
  if (pageSize) query.append('pageSize', String(pageSize));
  const qs = query.toString();
  return axios.get(`/classes${qs ? `?${qs}` : ''}`);
};

export const getClassDetail = (id: number) => {
  return axios.get(`/classes/${id}`);
};

export const createClass = (name: string, description: string) => {
  return axios.post('/classes', { name, description });
};

export const updateClass = (id: number, name: string, description: string) => {
  return axios.put(`/classes/${id}`, { name, description });
};

export const addUserToClass = (classID: number, userID: number) => {
  return axios.post(`/classes/${classID}/add-user`, { userID });
};

export const removeUserFromClass = (classID: number, userID: number) => {
  return axios.delete(`/classes/${classID}/users/${userID}`);
};

export const getUsersInClass = (classID: number) => {
  return axios.get(`/classes/${classID}/users`);
};

export const addQuizToClass = (classID: number, quizID: number) => {
  return axios.post(`/classes/${classID}/quizzes`, { quizID });
};

export const getQuizzesByClass = (classID: number) => {
  return axios.get(`/classes/${classID}/quizzes`);
};

// ===== QUIZZES =====
export const getAllQuizzes = () => {
  return axios.get('/quizzes');
};

export const getQuizDetail = (id: number) => {
  return axios.get(`/quizzes/${id}`);
};

export const getQuizForStudent = (id: number) => {
  return axios.get(`/quizzes/${id}/student`);
};

export const createQuiz = (data: {
  title: string;
  description?: string;
  timeStart: string;
  timeEnd: string;
  timeLimit: number;
  typeResult: string;
  countAttempt: number;
}) => {
  return axios.post('/quizzes', data);
};

export const updateQuiz = (id: number, data: {
  title: string;
  description?: string;
  timeStart: string;
  timeEnd: string;
  timeLimit: number;
  typeResult: string;
  countAttempt: number;
}) => {
  return axios.put(`/quizzes/${id}`, data);
};

export const createQuestionsBulk = (quizID: number, questions: {
  content: string;
  type: string;
  options: { content: string; isCorrect: boolean }[];
}[]) => {
  return axios.post(`/quizzes/${quizID}/questions/bulk`, questions);
};

export const submitQuizAttempt = (quizID: number, userID: number, answers: { questionID: number; optionID: number }[]) => {
  return axios.post(`/quizzes/${quizID}/submit`, { userID, answers });
};

export const getQuizScoresByClass = (quizID: number, classID: number) => {
  return axios.get(`/quizzes/${quizID}/scores`, { params: { classID } });
};

export const getMyAttempts = (userID: number) => {
  return axios.get('/quizzes/attempts/me', { params: { userID } });
};