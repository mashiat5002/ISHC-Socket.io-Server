const {jwtVerify, SignJWT} = require('jose');
const key="secret";
const secret_key= new TextEncoder().encode(key);
 const encrypt= (payload)=>{
    return new SignJWT(payload)
    .setProtectedHeader({alg:"HS256"})
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(secret_key);

}


 async function decrypt(input){
    const  {payload} = await jwtVerify(input, secret_key, {
        algorithms:['HS256']
    })

    return payload;
}
module.exports = {
    encrypt,
    decrypt
};