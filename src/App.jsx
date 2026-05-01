import { useState, useRef, useEffect } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";

function App() {
  const [chatHistory, setChatHistory] = useState([]);
  const [question, setQuestion] = useState("");
  const [generatingAnswer, setGeneratingAnswer] = useState(false);

  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, generatingAnswer]);

  async function generateAnswer(e) {
    e.preventDefault();
    if (!question.trim()) return;
    
    setGeneratingAnswer(true);
    const currentQuestion = question;
    setQuestion("");
    
    setChatHistory(prev => [...prev, { type: 'question', content: currentQuestion }]);
    
    try {
      const response = await axios({
        url: `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${
          import.meta.env.VITE_GEMINI_API_KEY
        }`,
        method: "post",
        data: {
          contents: [{ parts: [{ text: currentQuestion }] }],
        },
      });

      const aiResponse = response["data"]["candidates"][0]["content"]["parts"][0]["text"];
      setChatHistory(prev => [...prev, { type: 'answer', content: aiResponse }]);
    } catch (error) {
      console.error(error);
      setChatHistory(prev => [...prev, { type: 'answer', content: "Sorry - Something went wrong. Please try again!" }]);
    }
    setGeneratingAnswer(false);
  }

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      backgroundColor: '#0f172a',
      color: '#f8fafc',
      fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
    },
    header: {
      padding: '1rem 2rem',
      backgroundColor: '#1e293b',
      borderBottom: '1px solid #334155',
      textAlign: 'center',
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    },
    headerTitle: {
      margin: 0,
      fontSize: '1.5rem',
      fontWeight: '700',
      color: '#38bdf8',
      textDecoration: 'none',
    },
    chatArea: {
      flex: 1,
      overflowY: 'auto',
      padding: '2rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
      scrollbarWidth: 'thin',
      scrollbarColor: '#334155 #0f172a',
    },
    welcomeContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      textAlign: 'center',
      padding: '2rem',
    },
    welcomeCard: {
      backgroundColor: '#1e293b',
      padding: '2.5rem',
      borderRadius: '1rem',
      maxWidth: '600px',
      border: '1px solid #334155',
      boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
    },
    messageRow: (type) => ({
      display: 'flex',
      justifyContent: type === 'question' ? 'flex-end' : 'flex-start',
      width: '100%',
    }),
    bubble: (type) => ({
      maxWidth: '80%',
      padding: '1rem 1.25rem',
      borderRadius: '1.25rem',
      backgroundColor: type === 'question' ? '#3b82f6' : '#1e293b',
      color: '#f8fafc',
      border: type === 'question' ? 'none' : '1px solid #334155',
      borderBottomRightRadius: type === 'question' ? '0.25rem' : '1.25rem',
      borderBottomLeftRadius: type === 'answer' ? '0.25rem' : '1.25rem',
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      lineHeight: '1.6',
    }),
    inputContainer: {
      padding: '1.5rem 2rem',
      backgroundColor: '#0f172a',
      borderTop: '1px solid #334155',
    },
    inputWrapper: {
      maxWidth: '800px',
      margin: '0 auto',
      position: 'relative',
      display: 'flex',
      gap: '0.75rem',
      alignItems: 'flex-end',
      backgroundColor: '#1e293b',
      padding: '0.75rem',
      borderRadius: '1rem',
      border: '1px solid #334155',
      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    },
    textarea: {
      flex: 1,
      backgroundColor: 'transparent',
      border: 'none',
      color: '#f8fafc',
      padding: '0.5rem',
      fontSize: '1rem',
      outline: 'none',
      resize: 'none',
      maxHeight: '200px',
    },
    sendButton: {
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: '0.5rem',
      padding: '0.5rem 1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s',
      opacity: generatingAnswer ? '0.5' : '1',
    },
    loading: {
      color: '#94a3b8',
      fontSize: '0.875rem',
      fontStyle: 'italic',
      marginTop: '0.5rem',
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <a href="#" style={styles.headerTitle}>
          M10 Chat AI
        </a>
      </header>

      <div ref={chatContainerRef} style={styles.chatArea}>
        {chatHistory.length === 0 ? (
          <div style={styles.welcomeContainer}>
            <div style={styles.welcomeCard}>
              <h2 style={{ color: '#38bdf8', marginBottom: '1rem' }}>Welcome to M10 Chat AI 👋</h2>
              <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
                Your intelligent companion for answers, ideas, and creative help.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                {['General Knowledge', 'Code & Tech', 'Creative Writing', 'Problem Solving'].map(item => (
                  <div key={item} style={{ backgroundColor: '#0f172a', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #334155' }}>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          chatHistory.map((chat, index) => (
            <div key={index} style={styles.messageRow(chat.type)}>
              <div style={styles.bubble(chat.type)}>
                <ReactMarkdown>{chat.content}</ReactMarkdown>
              </div>
            </div>
          ))
        )}
        {generatingAnswer && (
          <div style={styles.messageRow('answer')}>
            <div style={{ ...styles.bubble('answer'), fontStyle: 'italic', color: '#94a3b8' }}>
              Thinking...
            </div>
          </div>
        )}
      </div>

      <div style={styles.inputContainer}>
        <form onSubmit={generateAnswer} style={styles.inputWrapper}>
          <textarea
            required
            style={styles.textarea}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type your message here..."
            rows="1"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                generateAnswer(e);
              }
            }}
          ></textarea>
          <button
            type="submit"
            disabled={generatingAnswer}
            style={styles.sendButton}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
          >
            {generatingAnswer ? '...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;