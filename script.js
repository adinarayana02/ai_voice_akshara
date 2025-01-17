let btn = document.querySelector("#btn");
let content = document.querySelector("#content");
let voice = document.querySelector("#voice");
let responseOutput = document.querySelector("#response-output");

const API_KEY = "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";
const MODEL = "llama3-8b-8192";

const fillerWords = ["um", "ah", "well", "you know", "actually"]; // Array of filler words

function speak(text) {
    const synth = window.speechSynthesis;
    let text_speak = new SpeechSynthesisUtterance(text);

    // Set speech properties
    text_speak.rate = 1;
    text_speak.pitch = 1;
    text_speak.volume = 1;
    text_speak.lang = "en-IN";

    // Ensure voices are loaded
    const voices = synth.getVoices();
    const femaleVoice = voices.find(voice =>
        voice.name.toLowerCase().includes("female") ||
        voice.name.toLowerCase().includes("susan") ||
        voice.lang === "en-IN"
    );

    if (femaleVoice) {
        text_speak.voice = femaleVoice;
    } else {
        console.warn("No female voice found; using default voice.");
    }

    // Highlight words as they are spoken
    const words = text.split(" ");
    let wordIndex = 0;

    text_speak.onboundary = (event) => {
        if (event.name === "word") {
            highlightWord(words, wordIndex);
            wordIndex++;
        }
    };

    text_speak.onend = () => {
        clearHighlight(); // Clear highlights after speech ends
    };

    synth.speak(text_speak);
}

function stopSpeaking() {
    window.speechSynthesis.cancel(); // Stop any ongoing speech synthesis
}

function highlightWord(words, index) {
    const highlightedText = words.map((word, i) => {
        if (i === index) {
            return `<span class="zoom-out" style="background-color: yellow;">${word}</span>`;
        }
        return word;
    }).join(" ");
    responseOutput.innerHTML = highlightedText; // Update displayed text with highlighted word
}

function clearHighlight() {
    responseOutput.innerHTML = responseOutput.innerText; // Remove highlight
}

function wishMe() {
    let day = new Date();
    let hours = day.getHours();
    if (hours >= 0 && hours < 12) {
        speak("Good Morning Sir");
    } else if (hours >= 12 && hours < 16) {
        speak("Good Afternoon Sir");
    } else {
        speak("Good Evening Sir");
    }
}

// Speech recognition setup
let speechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = new speechRecognition();

recognition.onresult = (event) => {
    let currentIndex = event.resultIndex;
    let transcript = event.results[currentIndex][0].transcript;
    content.innerText = transcript;
    takeCommand(transcript.toLowerCase());
};

btn.addEventListener("click", () => {
    stopSpeaking(); // Stop any ongoing speech synthesis
    resetApp(); // Reset the application state
    recognition.start();
    voice.style.display = "block";
    btn.style.display = "none";
});

function resetApp() {
    content.innerText = ""; // Clear the displayed transcript
    responseOutput.innerHTML = ""; // Clear the response output
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
                    { role: "system", content: "You are a professional and resourceful AI assistant designed to help technical software candidates prepare effectively for interviews. Provide detailed, accurate, and well-structured answers to technical questions while offering valuable insights and tips for interview success. Ensure your responses are clear, concise, and tailored to the candidate's skill level and domain expertise. Aim to boost the candidate's confidence and understanding by offering practical examples, explanations, and strategies for common and advanced technical scenarios." },
                    { role: "user", content: prompt },
                ],
                temperature: 0.7,
                max_tokens: 500,
            }),
        });

        const data = await response.json();
        if (data && data.choices && data.choices.length > 0) {
            return data.choices[0].message.content.trim();
        } else {
            return "Sorry, I couldn't process that. Please try again.";
        }
    } catch (error) {
        console.error("Error generating response:", error);
        return "There was an error connecting to the AI service.";
    }
}

async function takeCommand(message) {
    voice.style.display = "none";
    btn.style.display = "flex";

    if (message.includes("hello") || message.includes("hey")) {
        const response = "Hello Iam Akshra, what can I help you with?";
        displayAndSpeakResponse(response);
    } else if (message.includes("who are you")) {
        const response = "I am your virtual assistant, created by Adinarayana.";
        displayAndSpeakResponse(response);
    } else if (message.includes("open youtube")) {
        const response = "Opening YouTube";
        displayAndSpeakResponse(response);
        window.open("https://youtube.com/", "_blank");
    } else if (message.includes("open google")) {
        const response = "Opening Google";
        displayAndSpeakResponse(response);
        window.open("https://google.com/", "_blank");
    } else if (message.includes("open linkedin")) {
    const response = "Opening LinkedIn";
    displayAndSpeakResponse(response);
    window.open("https://www.linkedin.com/", "_blank");
    } else if (message.includes("search") || message.includes("look up")) {
        const query = message.replace(/search|look up|for/gi, "").trim(); // Extract search keywords
        if (query) {
            const response = `Searching for: ${query}`;
            displayAndSpeakResponse(response);
            const googleSearchURL = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
            window.open(googleSearchURL, "_blank");
        } else {
            const response = "Please specify what you would like me to search for.";
            displayAndSpeakResponse(response);
        }
    } else {
        const response = " ";
        displayAndSpeakResponse(response);
        const generatedResponse = await generateResponse(message);
        displayAndSpeakResponse(generatedResponse);
    }
}

function displayAndSpeakResponse(response) {
    // Inject filler words randomly
    const responseWithFillerWords = injectFillerWords(response);
    
    // Simulate breathing
    playBreathingSound();

    // Add natural pauses between sentences
    const responseWithPauses = addPauses(responseWithFillerWords);

    responseOutput.innerHTML = responseWithPauses; // Update the text area with the response
    speak(responseWithPauses); // Speak the response
}

function injectFillerWords(text) {
    const words = text.split(" ");
    const modifiedWords = words.map(word => {
        // Add a filler word randomly
        if (Math.random() < 0.1) {
            return `${fillerWords[Math.floor(Math.random() * fillerWords.length)]} ${word}`;
        }
        return word;
    });
    return modifiedWords.join(" ");
}

function playBreathingSound() {
    // Simulated breathing sound (replace with your desired sound URL)
    const breathingSound = new Audio("breathing-sound-url.mp3");
    breathingSound.play();
}

function addPauses(text) {
    return text.replace(/([.?!])\s*/g, "$1 <pause>");
}

// Stop speech synthesis when the page is refreshed
window.addEventListener("beforeunload", () => {
    stopSpeaking();
});

// Ensure voices are loaded before the first use
window.speechSynthesis.onvoiceschanged = () => {
    console.log("Voices loaded:", window.speechSynthesis.getVoices());
};
