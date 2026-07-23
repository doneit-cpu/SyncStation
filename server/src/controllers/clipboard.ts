// all clipboard logic here,

// post 
import clipboard from "clipboardy"

// in pc we can copy paste image how do we do that ??? [    ]

// for text purpose 
export async function t_content() {
  setInterval(async () => {
    const content = await clipboard.read();
    console.log("let's check",content);
  }, 200);
}

// need to make small unique way to take only valueable thing 

// used this for sending content into other user
// navigator.clipboard.writeText(content)   .. write this into frontend so can u pls do that ,  

// get 

export async function s_content(data:string) {
  console.log("we will overwritten")
  clipboard.write(data);
}

