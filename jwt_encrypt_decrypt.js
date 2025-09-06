
import { jwtVerify, SignJWT } from "jose";

const key="secret";
const secret_key= new TextEncoder().encode(key);
export const encrypt= (payload)=>{
    return new SignJWT(payload)
    .setProtectedHeader({alg:"HS256"})
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(secret_key);

}


export async function decrypt(input){
    const  {payload} = await jwtVerify(input, secret_key, {
        algorithms:['HS256']
    })

    return payload;
}
