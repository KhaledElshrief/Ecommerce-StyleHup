import { loginFailure, loginStart, loginSuccess } from "./userRedux";
import { publicRequest } from './../requestMethods';

export const register = async (user) => {
    const res = await publicRequest.post("/auth/register", user);
    return res.data;
};

export const login =async function  (dispatch,user){
    dispatch(loginStart());
    try{
        const res = await publicRequest.post("/auth/login",user);
        dispatch(loginSuccess(res.data));
    }catch(err){
        dispatch(loginFailure());
    }
}
