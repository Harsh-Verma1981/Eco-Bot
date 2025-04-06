import { GoogleGenerativeAI } from "@google/generative-ai";

const businessInfo = `

Recycling
Recycling is the process of converting waste materials into reusable products to conserve resources and reduce pollution. It helps lower the amount of waste sent to landfills and saves energy compared to producing items from raw materials. Common recyclables include paper, plastic, glass, and metals.

Causes of Waste
Waste is primarily caused by overconsumption, excessive packaging, single-use products, and lack of awareness about sustainable practices. Industries that produce goods in bulk without considering eco-friendly methods also contribute significantly to waste generation.

Prevention of Waste
Waste prevention begins with mindful consumption. This includes reducing the use of disposables, reusing items whenever possible, and recycling properly. Composting organic waste and choosing products with minimal packaging are also effective ways to minimize household and industrial waste.

Battery Disposal
Batteries should never be thrown in regular trash bins as they contain harmful chemicals that can leak into the environment. Used batteries must be taken to designated e-waste collection centers or recycling facilities where they can be handled safely and responsibly.

How to Reduce Waste
To reduce waste, individuals should adopt sustainable habits such as carrying reusable bags and bottles, buying in bulk to minimize packaging, donating unused items, and repairing instead of replacing broken items. Every small action adds up to a significant environmental impact.

Spreading Awareness
Spreading awareness is key to encouraging collective action. People can share information through social media, participate in clean-up campaigns, organize workshops, and talk to family and friends about the importance of environmental care. Education and community involvement play a big role in driving change.

`;

const API_KEY = "AIzaSyDdimfb34eDU7np5yyvjIDTJHh5ktsBA6U";// Gemini API key..
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-pro",
    systemInstruction: businessInfo
});

let messages = {
    history: [],
}

async function sendMessage() {

    console.log(messages);
    const userMessage = document.querySelector(".chat-window input").value;
    
    if (userMessage.length) {

        try {
            document.querySelector(".chat-window input").value = "";
            document.querySelector(".chat-window .chat").insertAdjacentHTML("beforeend",`
                <div class="user">
                    <p>${userMessage}</p>
                </div>
            `);

            document.querySelector(".chat-window .chat").insertAdjacentHTML("beforeend",`
                <div class="loader"></div>
            `);

            const chat = model.startChat(messages);

            let result = await chat.sendMessageStream(userMessage);
            
            document.querySelector(".chat-window .chat").insertAdjacentHTML("beforeend",`
                <div class="model">
                    <p></p>
                </div>
            `);
            
            let modelMessages = '';

            for await (const chunk of result.stream) {
              const chunkText = chunk.text();
              modelMessages = document.querySelectorAll(".chat-window .chat div.model");
              modelMessages[modelMessages.length - 1].querySelector("p").insertAdjacentHTML("beforeend",`
                ${chunkText}
            `);
            }

            messages.history.push({
                role: "user",
                parts: [{ text: userMessage }],
            });

            messages.history.push({
                role: "model",
                parts: [{ text: modelMessages[modelMessages.length - 1].querySelector("p").innerHTML }],
            });

        } catch (error) {
            document.querySelector(".chat-window .chat").insertAdjacentHTML("beforeend",`
                <div class="error">
                    <p>The message could not be sent. Please try again.</p>
                </div>
            `);
        }

        document.querySelector(".chat-window .chat .loader").remove();
        
    }
}

document.querySelector(".chat-window .input-area button")
.addEventListener("click", ()=>sendMessage());

document.querySelector(".chat-button")
.addEventListener("click", ()=>{
    document.querySelector("body").classList.add("chat-open");
});

document.querySelector(".chat-window button.close")
.addEventListener("click", ()=>{
    document.querySelector("body").classList.remove("chat-open");
});
