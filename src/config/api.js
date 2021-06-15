import { baseUrl } from "./env";
import { DMSUrl } from "./env"

// let AS_url = '54.64.87.19:8083' + baseUrl;
let userUrl = baseUrl + '/users'
let storageUrl = DMSUrl + '/storage';

//user Api
export const user_signup_url = userUrl + '/signUp' ;
export const user_login_url = userUrl + '/login';
export const user_authenticate_url = userUrl + '/authenticate';

//dataset Api
export const datasets_url = DMSUrl + '/datasets';
export const file_upload_url = storageUrl + '/upload';

//training Api
export const training_job_url = DMSUrl + '/trainingJobs';