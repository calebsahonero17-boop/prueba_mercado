import React, { useState, useRef, useEffect } from 'react';
import { IoSend } from 'react-icons/io5';

interface Message {
  text: string;
  sender: 'user' | 'bot';
}

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatbotKnowledgeBase: { [key: string]: string } = {
    "¿qué es mercado express bolivia?": "Mercado Express Bolivia es una plataforma donde puedes comprar y vender productos de forma fácil, rápida y segura.",
    "¿en qué ciudades operan actualmente?": "Actualmente operamos exclusivamente en la ciudad de Santa Cruz.",
    "¿qué tipo de productos puedo encontrar?": "Productos de tecnología, moda, deportes, hogar, belleza, vehículos, accesorios y más.",
    "¿cómo puedo registrarme como comprador o vendedor?": "Solo debes ingresar a la web, hacer clic en “Crear cuenta” y elegir tu tipo de registro.",
    "¿qué métodos de pago aceptan?": "Solo aceptamos pagos mediante QR.",
    "¿puedo pagar con qr o transferencia bancaria?": "Aceptamos únicamente pagos por QR Simple o Billetera Móvil.",
    "¿es seguro comprar y vender?": "Sí, contamos con sistemas de verificación y cifrado de seguridad.",
    "¿cómo protegen mis datos?": "Usamos protocolos de seguridad y cumplimos normas de protección de datos.",
    "¿cómo puedo vender mis productos?": "Regístrate como vendedor, sube tus productos con fotos y descripción.",
    "¿cuáles son los requisitos para ser vendedor verificado?": "Proporciona una identificación válida y cumple con las políticas de venta.",
    "¿cómo puedo destacar mis productos?": "Puedes marcar tus artículos como “Oferta Especial” desde tu panel de vendedor.",
    "¿cómo puedo comunicarme con el equipo de soporte?": "Escríbenos a mercadoexpressbolivia@gmail.com o escanea el código QR en nuestra web.",
    "¿dónde puedo escanear el código qr?": "En el pie de página del sitio web o nuestras redes sociales oficiales.",
    "¿tienen atención al cliente por whatsapp o correo?": "Sí, vía WhatsApp (enlace QR) o correo electrónico.",
  };

  const suggestedQuestions = Object.keys(chatbotKnowledgeBase);

  useEffect(() => {
    setMessages([
      {
        text: "👋 ¡Hola! Soy el asistente virtual de Mercado Express Bolivia. ¿En qué puedo ayudarte hoy?",
        sender: 'bot',
      },
    ]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getBotResponse = (userQuestion: string): string => {
    const normalizedInput = userQuestion.toLowerCase().trim();
    for (const question in chatbotKnowledgeBase) {
      if (normalizedInput.includes(question)) {
        return chatbotKnowledgeBase[question];
      }
    }
    return "Por el momento no tengo esa información, pero puedes escribirnos a mercadoexpressbolivia@gmail.com 📩 o escanear el código QR para hablar con un asesor.";
  };

  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;

    const userQuestion = inputValue;
    const newUserMessage: Message = { text: userQuestion, sender: 'user' };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);

    const botResponseText = getBotResponse(userQuestion);

    const newBotMessage: Message = { text: botResponseText, sender: 'bot' };
    setTimeout(() => {
      setMessages((prevMessages) => [...prevMessages, newBotMessage]);
    }, 500);

    setInputValue('');
  };

  const handleQuestionClick = (question: string) => {
    const newUserMessage: Message = { text: question, sender: 'user' };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);

    const botResponseText = getBotResponse(question);

    const newBotMessage: Message = { text: botResponseText, sender: 'bot' };
    setTimeout(() => {
      setMessages((prevMessages) => [...prevMessages, newBotMessage]);
    }, 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="flex w-full bg-white rounded-lg shadow-xl border border-gray-200 h-[600px]"> {/* Main container for two columns */}
      {/* Left Column: Suggested Questions */}
      <div className="w-1/3 p-4 border-r border-gray-200 flex flex-col">
        <p className="text-lg font-semibold mb-4">Preguntas frecuentes:</p>
        <div className="flex-1 overflow-y-auto space-y-2">
          {suggestedQuestions.map((question, index) => (
            <button
              key={index}
              className="w-full text-left p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm text-gray-700"
              onClick={() => handleQuestionClick(question)}
            >
              {question}
            </button>
          ))}
        </div>
      </div>

      {/* Right Column: Chat Window */}
      <div className="w-2/3 flex flex-col">
        {/* Chat Header */}
        <div className="bg-blue-500 text-white p-3 rounded-tr-lg flex items-center justify-between">
          <h3 className="font-semibold text-lg">Mercado Express Bolivia</h3>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-3 overflow-y-auto space-y-2">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] p-2 rounded-lg ${
                  msg.sender === 'user'
                    ? 'bg-gray-200 text-gray-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="border-t border-gray-200 p-3 flex items-center">
          <input
            type="text"
            className="flex-1 border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Escribe tu mensaje..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button
            className="ml-2 bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600 transition-colors duration-300"
            onClick={handleSendMessage}
          >
            <IoSend size={18} />
          </button>
        </div>

        {/* Fixed Contact Info */}
        <div className="text-center text-xs text-gray-500 p-2 border-t border-gray-100">
          📩 Contacto: mercadoexpressbolivia@gmail.com
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
