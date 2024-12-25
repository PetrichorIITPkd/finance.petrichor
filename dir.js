import fs from "fs"
import path from "path"

let events_data = await fetch('https://petri-back.vercel.app/internal/images/all/', {
    method: 'POST',
    headers: {
        'Content-type': 'application/json',
    },
    credentials: 'include',
    mode: 'cors',
    body: JSON.stringify({
        "password": process.env.pass
    })
}).then(res => res.json())
.then(async res => {
    console.log("Got all images")
    fs.rmSync("./static/uploads/",{recursive:true,force:true})
    fs.mkdirSync("./static/uploads/",{recursive:true})
    
    for (const image of res.data) {
        fs.writeFileSync(path.resolve("./static/uploads/",`${image.name.toLowerCase()}.png`),Buffer.from(image.image,'base64'))
    }
    return res.data
}).catch(err => {
    console.log(err.toString())
})