let btn = document.querySelector("#btn");
let content = document.querySelector("#content");
let voice = document.querySelector("#voice");
let responseOutput = document.querySelector("#response-output");

const API_KEY = "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";
const MODEL = "llama3-8b-8192";

function speak(text) {
    const synth = window.speechSynthesis;
    let text_speak = new SpeechSynthesisUtterance(text);

    text_speak.rate = 1; // Adjust speed for natural tone
    text_speak.pitch = 1;
    text_speak.volume = 1;
    text_speak.lang = "en-IN";

    const voices = synth.getVoices();
    const preferredVoice = voices.find(voice =>
        voice.name.toLowerCase().includes("female") ||
        voice.lang === "en-IN"
    );

    if (preferredVoice) {
        text_speak.voice = preferredVoice;
    }

    synth.speak(text_speak);
}

function stopSpeaking() {
    window.speechSynthesis.cancel();
}

function wishMe() {
    let hours = new Date().getHours();
    if (hours >= 0 && hours < 12) {
        speak("Good Morning! How can I brighten your day?");
    } else if (hours >= 12 && hours < 16) {
        speak("Good Afternoon! What can I do for you?");
    } else {
        speak("Good Evening! Ready for some productive time?");
    }
}

let speechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = new speechRecognition();

recognition.onresult = (event) => {
    let currentIndex = event.resultIndex;
    let transcript = event.results[currentIndex][0].transcript;
    content.innerText = transcript;
    takeCommand(transcript.toLowerCase());
};

btn.addEventListener("click", () => {
    stopSpeaking();
    resetApp();
    recognition.start();
    voice.style.display = "block";
    btn.style.display = "none";
});

function resetApp() {
    content.innerText = "";
    responseOutput.innerHTML = "";
}

async function generateResponse(prompt) {
    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: MODEL,
                messages: [
                    { role: "system", content: "You are a friendly, emotional, and highly supportive virtual assistant." },
                    { role: "user", content: prompt },
                ],
                temperature: 0.8,
                max_tokens: 300,
            }),
        });

        const data = await response.json();
        if (data && data.choices && data.choices.length > 0) {
            return data.choices[0].message.content.trim();
        } else {
            return "Sorry, I couldn't understand that. Could you please repeat?";
        }
    } catch (error) {
        console.error("Error generating response:", error);
        return "I'm having trouble connecting to my brain! Please try again later.";
    }
}

async function takeCommand(message) {
    voice.style.display = "none";
    btn.style.display = "flex";

    if (message.includes("hello") || message.includes("hi")) {
        const response = "Hey there! How's it going? 😊";
        displayAndSpeakResponse(response);
    } else if (message.includes("how are you")) {
        const response = "I'm just a bundle of code, but I'm feeling great! How about you?";
        displayAndSpeakResponse(response);
    } else if (message.includes("tell me a joke")) {
        const jokes = [
            "Why don’t skeletons fight each other? They don’t have the guts. 😂",
            "What do you call fake spaghetti? An impasta! 🍝",
            "Why did the bicycle fall over? Because it was two-tired! 🚲"
        ];
        const response = jokes[Math.floor(Math.random() * jokes.length)];
        displayAndSpeakResponse(response);
    } else if (message.includes("open youtube")) {
        const response = "Sure, opening YouTube for you! Enjoy!";
        displayAndSpeakResponse(response);
        window.open("https://youtube.com/", "_blank");
    } else if (message.includes("search for")) {
        const query = message.replace(/search for/gi, "").trim();
        if (query) {
            const response = `Searching Google for: ${query}`;
            displayAndSpeakResponse(response);
            window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, "_blank");
        } else {
            const response = "What should I search for?";
            displayAndSpeakResponse(response);
        }
    } else if (message.includes("i feel")) {
        const emotion = message.replace("i feel", "").trim();
        const response = `I'm here for you! It's okay to feel ${emotion}. Want to talk more about it?`;
        displayAndSpeakResponse(response);
    } else {
        const response = "Let me think... 🤔";
        displayAndSpeakResponse(response);
        const generatedResponse = await generateResponse(message);
        displayAndSpeakResponse(generatedResponse);
    }
}

function displayAndSpeakResponse(response) {
    responseOutput.innerHTML = response;
    speak(response);
}

window.addEventListener("beforeunload", () => {
    stopSpeaking();
});

window.speechSynthesis.onvoiceschanged = () => {
    console.log("Voices updated.");
};
