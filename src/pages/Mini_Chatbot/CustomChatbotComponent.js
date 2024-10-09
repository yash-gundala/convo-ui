import React, { useState, useEffect, useRef } from "react";
import { FaUser, FaRobot } from "react-icons/fa";
import axios from "axios";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw"; // Import rehype-raw
import chatbotIcon from "../../assets/Images/chatbot.png";
import * as sdk from "microsoft-cognitiveservices-speech-sdk";
import { Box, IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import MicIcon from "@mui/icons-material/Mic"; // Import MUI Microphone Icon
import SendIcon from "@mui/icons-material/Send"; // Import MUI Send Icon
import KeyboardVoiceIcon from "@mui/icons-material/KeyboardVoice"; // Import MUI KeyboardVoice Icon
import Button from "@mui/material/Button"; // Import MUI Button
import Typography from "@mui/material/Typography"; // Import MUI Typography
import Card from "@mui/material/Card"; // Import MUI Card
import CardContent from "@mui/material/CardContent"; // Import MUI CardContent
import "./styles.css"; // Ensure you import the CSS file
const SPEECH_KEY = "f4a8f5be7801494fa47bc87d6d8ca31d";
const SPEECH_REGION = "eastus";

const CustomChatbotComponent = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState([]);
  const chatContainerRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const [recognizer, setRecognizer] = useState(null);
   const [transcription, setTranscription] = useState("");

  const handleToggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const handleClickOutside = (event) => {
    if (
      chatContainerRef.current &&
      !chatContainerRef.current.contains(event.target)
    ) {
      setIsChatOpen(false);
    }
  };

  const handleSendMessage = async () => {
    const query = inputValue;
    setInputValue("");
    const userMessage = { answer: query, sender: "user" };
    const botMessage = { sender: "bot", display: 0, answer: "" };

    // Update messages state with user and bot messages
    setMessages((prevMessages) => {
      const newMessages = [...prevMessages, userMessage, botMessage];
      console.log("Messages after adding user and bot messages:", newMessages);
      return newMessages;
    });

    if (query) {
      try {
        const response = await fetch(
          "https://streamlit-test.thankfulriver-bb957f46.koreacentral.azurecontainerapps.io/rag_qa_api_stream",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ text: query }),
          }
        );

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let responseText = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          responseText += chunk;
          setMessages((prevMessages) => {
            const newMessages = [...prevMessages];
            newMessages[newMessages.length - 1].answer = responseText;
            return newMessages;
          });
        }
        setInputValue("");
        const relatedQuestionsResponse = await fetch(
          "https://streamlit-test.thankfulriver-bb957f46.koreacentral.azurecontainerapps.io/related_questions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ prompt: query, answer: responseText }),
          }
        );

        const relatedQuestionsData = await relatedQuestionsResponse.json();
        const newRelatedQuestions =
          relatedQuestionsData.related_questions || [];

        // Filter out duplicate links
        const uniqueRelatedQuestions = Array.from(new Set(newRelatedQuestions));

        setMessages((prevMessages) => {
          const newMessages = [...prevMessages];
          newMessages.push({
            sender: "bot_rq",
            answer: JSON.stringify(uniqueRelatedQuestions),
          });
          console.log("Messages after adding related questions:", newMessages);
          return newMessages;
        });
      } catch (error) {
        console.error("Error fetching bot response:", error);
        const errorMessage = {
          answer: "Sorry, something went wrong.",
          sender: "bot",
        };
        setMessages((prevMessages) => {
          const newMessages = [...prevMessages, errorMessage];
          console.log("Messages after error:", newMessages);
          return newMessages;
        });
      }
    }
  };

  useEffect(() => {
    const audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();
    const speechConfig = sdk.SpeechConfig.fromSubscription(
      SPEECH_KEY,
      SPEECH_REGION
    );

    // Create the recognizer
    const speechRecognizer = new sdk.SpeechRecognizer(
      speechConfig,
      audioConfig
    );
    setRecognizer(speechRecognizer);

    return () => {
      if (speechRecognizer) {
        speechRecognizer.close();
      }
    };
  }, []);

  const correctSpecialWords = (text) => {
    return text
      .split(" ")
      .map((word) => {
        switch (word.toLowerCase()) {
          case "amd epic":
            return "AMD EPYC";
          case "amd risen":
            return "AMD RYZEN";
          case "processes":
            return "processors";
          case "epic":
          case "pick":
            return "EPYC";
          case "risen":
          case "horizon":
          case "rise and":
            return "RYZEN";
          case "amd":
          case "md":
          case "mda":
            return "AMD";
          default:
            return word;
        }
      })
      .join(" ");
  };

  const startListening = async () => {
    if (recognizer) {
      setIsListening(true);

      recognizer.startContinuousRecognitionAsync(
        () => {
          console.log("Continuous recognition started");
        },
        (error) => {
          console.error("Error starting continuous recognition:", error);
          setIsListening(false);
        }
      );

      let previousWords = [];
      let currentSearchValue = "";

      recognizer.recognizing = (s, e) => {
        if (e.result.reason === sdk.ResultReason.RecognizingSpeech) {
          const currentWords = e.result.text.split(" ");
          const newWords = currentWords.filter(
            (word) => !previousWords.includes(word)
          );

          if (newWords.length > 0) {
            const interimText = correctSpecialWords(newWords.join(" "));
            currentSearchValue = (
              currentSearchValue +
              " " +
              interimText
            ).trim();

            console.log("New words:", interimText);
            console.log("Updated Search Value:", currentSearchValue);

            setInputValue(currentSearchValue);
            previousWords = currentWords;
          }
        }
      };
      recognizer.recognized = (s, e) => {
        if (e.result.reason === sdk.ResultReason.RecognizedSpeech) {
          setTranscription((prevTranscription) => {
            // Correct the recognized text
            const correctedText = correctSpecialWords(e.result.text);
            const newTranscription = prevTranscription + " " + correctedText;

            console.log("RECOGNIZED:", e.result.text);
            console.log("Corrected Text:", correctedText);
            console.log("New Transcription:", newTranscription);

            setInputValue(newTranscription);
            return newTranscription;
          });
        } else if (e.result.reason === sdk.ResultReason.NoMatch) {
          console.log("NOMATCH: Speech could not be recognized.");
        }
      };
    }
  };

  const stopListening = () => {
    if (recognizer) {
      recognizer.stopContinuousRecognitionAsync(
        () => {
          console.log("Continuous recognition stopped");
          setIsListening(false);
        },
        (error) => {
          console.error("Error stopping continuous recognition:", error);
        }
      );
    }
  };

  useEffect(() => {
    if (isChatOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isChatOpen]);

  // useEffect to render on change in answer
  useEffect(() => {
    // Perform actions when the answer changes
    console.log("Answer has changed:", messages);
    // Scroll to the bottom of the chat container
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div>
      {!isChatOpen && (
        <button className="chatbot-button" onClick={handleToggleChat}>
          <img src={chatbotIcon} alt="Chat" />
        </button>
      )}
      {isChatOpen && (
        <div className="chatbot-container" ref={chatContainerRef}>
          <div className="chatbot-content">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`message ${message.sender}`}
                style={{
                  justifyContent:
                    message.sender === "user" ? "flex-end" : "flex-start",
                }}
              >
                {message.sender === "bot" && (
                  <>
                    <FaRobot className="message-icon bot-icon" />
                    <div className="message-content">
                      <Markdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          a: ({ node, ...props }) => (
                            <a
                              {...props}
                              target="_blank"
                              rel="noopener noreferrer"
                            />
                          ),
                        }}
                        // rehypePlugins={[rehypeRaw]}
                      >
                        {message.answer}
                      </Markdown>
                    </div>
                  </>
                )}
                {message.sender === "bot_rq" && (
                  <>
                    <div
                      style={{
                        marginLeft: "22px", // Adjust margin to separate the icon from the content
                        display: "flex",
                        textAlign: "left",
                        justifyContent: "flex-start",
                        flexDirection: "column",
                        width: "90%", // Adjust width to fit the mini chatbot
                        maxWidth: "400px", // Set a maximum width similar to the mini chatbot
                        margin: "0 auto", // Center the content
                        padding: "10px", // Add padding for better spacing
                      }}
                    >
                      <div className="related-questions">
                        <Typography variant="h6" style={{ fontSize: "0.8rem" }}>
                          Related Questions:
                        </Typography>
                        {JSON.parse(message.answer).map((question, qIndex) => (
                          <Card
                            key={qIndex}
                            onClick={() => setInputValue(question)}
                            className="related-question-card"
                            style={{
                              border: "1px solid #ccc",
                              marginBottom: "5px",
                              fontSize: "8pt", // Adjust font size
                              width: "90%", // Adjust width
                              cursor: "pointer", // Change cursor to pointer
                              transition: "background-color 0.3s", // Smooth transition for background color
                            }}
                          >
                            <CardContent
                              style={{
                                paddingTop: "2px",
                                paddingBottom: "2px",
                              }}
                            >
                              {/* Adjust padding */}
                              <Box
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                              >
                                <Typography variant="p">
                                  {question}
                                </Typography>
                                <IconButton>
                                  <AddIcon />
                                </IconButton>
                              </Box>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                {message.sender === "user" && (
                  <>
                    <FaUser className="message-icon user-icon" />
                    <div className="message-content">
                      <div className="message-text">{message.answer}</div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
          <div className="input-container">
            <Button
              style={{ color: isListening ? "red" : "black" }}
              onClick={isListening ? stopListening : startListening}
            >
              <KeyboardVoiceIcon />
            </Button>
            <input
              className="searchInput"
              placeholder="Enter the prompt"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") handleSendMessage();
              }}
            />
            <Button style={{ color: "black" }} onClick={handleSendMessage}>
              <SendIcon />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomChatbotComponent;
