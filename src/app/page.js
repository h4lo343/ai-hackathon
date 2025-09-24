'use client';

import { useState } from 'react';
import styled from 'styled-components';
import useSWR from 'swr';
import * as XLSX from 'xlsx';

const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Title = styled.h1`
  text-align: center;
  color: #333;
  margin-bottom: 2rem;
  font-size: 1.8rem;
`;

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 1rem;
`;

const ContextSection = styled.div`
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 1.5rem;
`;

const SectionTitle = styled.h3`
  margin: 0 0 1rem 0;
  color: #495057;
  font-size: 1.1rem;
`;

const ContextTextArea = styled.textarea`
  width: 100%;
  padding: 1rem;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  resize: vertical;
  min-height: 120px;
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: #0070f3;
  }
`;

const SubmitContextButton = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: #0070f3;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 1rem;
  
  &:hover {
    background-color: #0051a2;
  }
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const ConversationSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  overflow: hidden;
`;

const ConversationHeader = styled.div`
  background-color: #f8f9fa;
  padding: 1rem;
  border-bottom: 1px solid #e9ecef;
`;

const ConversationArea = styled.div`
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  background-color: #ffffff;
  min-height: 300px;
  max-height: 400px;
`;

const Message = styled.div`
  margin-bottom: 1rem;
  padding: 0.75rem;
  border-radius: 8px;
  background-color: ${props => props.isUser ? '#0070f3' : '#f1f3f4'};
  color: ${props => props.isUser ? 'white' : '#333'};
  margin-left: ${props => props.isUser ? '2rem' : '0'};
  margin-right: ${props => props.isUser ? '0' : '2rem'};
`;

const MessageLabel = styled.div`
  font-weight: bold;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  opacity: 0.8;
`;

const MessageContent = styled.div`
  line-height: 1.5;
  white-space: pre-wrap;
`;

const InputSection = styled.div`
  padding: 1rem;
  border-top: 1px solid #e9ecef;
  background-color: #f8f9fa;
  display: flex;
  gap: 1rem;
`;

const MessageInput = styled.input`
  flex: 1;
  padding: 0.75rem;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #0070f3;
  }
`;

const SendButton = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: #0070f3;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #0051a2;
  }
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  color: #666;
  font-style: italic;
  padding: 1rem;
`;

const ErrorMessage = styled.div`
  color: #e00;
  background-color: #ffe6e6;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem;
`;

const FeedbackTable = styled.div`
  margin-top: 1rem;
  background-color: #ffffff;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  overflow: hidden;
`;

const TableHeader = styled.div`
  background-color: ${props => props.isSatisfactory ? '#d4edda' : '#f8d7da'};
  color: ${props => props.isSatisfactory ? '#155724' : '#721c24'};
  padding: 1rem;
  font-weight: bold;
  font-size: 1.1rem;
  text-align: center;
  border-bottom: 1px solid #e9ecef;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeaderRow = styled.tr`
  background-color: #f8f9fa;
`;

const TableHeaderCell = styled.th`
  padding: 1rem;
  text-align: left;
  font-weight: bold;
  border-bottom: 2px solid #e9ecef;
  color: #495057;
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: #f8f9fa;
  }
`;

const TableCell = styled.td`
  padding: 1rem;
  border-bottom: 1px solid #e9ecef;
  vertical-align: top;
  line-height: 1.5;
`;

const PointCell = styled(TableCell)`
  font-weight: 600;
  color: #495057;
`;

const ExplanationCell = styled(TableCell)`
  color: #6c757d;
`;

const ExportButton = styled.button`
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s;
  margin: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background-color: #218838;
  }
  
  &:active {
    background-color: #1e7e34;
  }
`;

const ExportIcon = styled.span`
  font-size: 1rem;
`;
const CheckboxContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #495057;
  font-size: 0.9rem;
`;

const Checkbox = styled.input`
  accent-color: #0070f3;
`;

// Fetcher function for SWR
const fetcher = (url, options) => fetch(url, options).then((res) => res.json());

export default function Home() {
  const [context, setContext] = useState('');
  const [contextSubmitted, setContextSubmitted] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [conversation, setConversation] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackData, setFeedbackData] = useState(null);

  // Function to parse feedback response
  const parseFeedbackResponse = (response) => {
    const hasResult = response.toLowerCase().includes('result:');
    const hasExplanation = response.toLowerCase().includes('explanation:');
    const hasPoint = response.toLowerCase().includes('point:');
    
    if (hasResult && hasExplanation && hasPoint) {
      // Extract result
      const resultMatch = response.match(/result:\s*(satisfactory|not yet satisfactory)/i);
      const result = resultMatch ? resultMatch[1].toLowerCase() : null;
      
      // Extract points and explanations
      const points = [];
      const explanations = [];
      
      // Split by "Point:" and process each section
      const sections = response.split(/point:/gi);
      
      for (let i = 1; i < sections.length; i++) {
        const section = sections[i];
        const lines = section.split('\n').map(line => line.trim()).filter(line => line);
        
        // First line is the point
        if (lines[0]) {
          points.push(lines[0].replace(/^[-•]\s*/, '').trim());
        }
        
        // Find explanation in the section
        const explanationMatch = section.match(/explanation:\s*([^]*?)(?=point:|$)/i);
        if (explanationMatch) {
          const explanation = explanationMatch[1].trim().replace(/^[-•]\s*/, '');
          explanations.push(explanation);
        }
      }
      
      return {
        result,
        points,
        explanations,
        isSatisfactory: result === 'satisfactory'
      };
    }
    
    return null;
  };

  // Function to export feedback data to Excel
  const exportToExcel = () => {
    if (!feedbackData) return;

    // Prepare data for Excel
    const excelData = [
      ['Assessment Result', feedbackData.result],
      ['Assessment Date', new Date().toLocaleDateString()],
      ['Assessment Time', new Date().toLocaleTimeString()],
      ['', ''], // Empty row
      ['Point', 'Explanation']
    ];

    // Add points and explanations
    feedbackData.points.forEach((point, index) => {
      excelData.push([
        point,
        feedbackData.explanations[index] || 'No explanation provided'
      ]);
    });

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(excelData);

    // Set column widths
    ws['!cols'] = [
      { wch: 50 }, // Point column
      { wch: 80 }  // Explanation column
    ];

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Assessment Results');

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = `assessment-results-${timestamp}.xlsx`;

    // Save file
    XLSX.writeFile(wb, filename);
  };

  const handleContextSubmit = async (e) => {
    e.preventDefault();
    if (context.trim()) {
      setContextSubmitted(true);
      setIsLoading(true);
      
      // Add system message about context
      const systemMessage = {
        role: 'system',
        content: `Context provided: ${context}`,
        timestamp: new Date().toISOString()
      };
      
      setConversation([systemMessage]);

      try {
        // Get AI's first response based on the context
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            context: context,
            messages: [systemMessage]
          }),
        });

        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }

        const aiMessage = {
          role: 'assistant',
          content: data.response,
          timestamp: new Date().toISOString()
        };

        setConversation([systemMessage, aiMessage]);
        
        // Check if this is a feedback response
        const parsedFeedback = parseFeedbackResponse(data.response);
        if (parsedFeedback) {
          setFeedbackData(parsedFeedback);
        }
      } catch (error) {
        console.error('Error getting initial AI response:', error);
        const errorMessage = {
          role: 'system',
          content: `Error: ${error.message}`,
          timestamp: new Date().toISOString()
        };
        setConversation([systemMessage, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleMessageSubmit = async (e) => {
    e.preventDefault();
    if (!currentMessage.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: currentMessage,
      timestamp: new Date().toISOString()
    };

    const newConversation = [...conversation, userMessage];
    setConversation(newConversation);
    setCurrentMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          context: context,
          messages: newConversation
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

        const aiMessage = {
          role: 'assistant',
          content: data.response,
          timestamp: new Date().toISOString()
        };

        setConversation([...newConversation, aiMessage]);
        
        // Check if this is a feedback response
        const parsedFeedback = parseFeedbackResponse(data.response);
        if (parsedFeedback) {
          setFeedbackData(parsedFeedback);
        }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        role: 'system',
        content: `Error: ${error.message}`,
        timestamp: new Date().toISOString()
      };
      setConversation([...newConversation, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <Title>Team Just Assess</Title>
      <Title>AI Competency Assessment  Simulation</Title>
      
      <ChatContainer>
        <ContextSection>
          <SectionTitle>Assessment Conversation Context</SectionTitle>
          <ContextTextArea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Provide context about the assessment"
            disabled={contextSubmitted}
          />
          {!contextSubmitted && (
            <SubmitContextButton 
              onClick={handleContextSubmit} 
              disabled={!context.trim()}
            >
              Set Context & Start Conversation
            </SubmitContextButton>
          )}
                       <CheckboxContainer>
                <CheckboxLabel>
                  <Checkbox 
                    type="checkbox" 
                  />
                  Residential
                </CheckboxLabel>
                <CheckboxLabel  type="checkbox" >
                  <Checkbox 
         type="checkbox" 
                  />
                  Home Care
                </CheckboxLabel>
                <CheckboxLabel>
                  <Checkbox type="checkbox" />
                  Palliative Care
                </CheckboxLabel>
                <CheckboxLabel>
                  <Checkbox type="checkbox" />
                  Dementia Care
                </CheckboxLabel>
                <CheckboxLabel>
                  <Checkbox type="checkbox" />
                  Rehabilitation Services
                </CheckboxLabel>
                <CheckboxLabel>
                  <Checkbox type="checkbox" />
                  Respite Care
                </CheckboxLabel>
              </CheckboxContainer>
          {contextSubmitted && !isLoading && (
            <> 
            <div style={{ marginTop: '1rem', color: '#28a745', fontWeight: 'bold' }}>
              ✓ Context set! You can now start chatting below.
            </div>
  
              </>
          )}
          {isLoading && (
            <div style={{ marginTop: '1rem', color: '#0070f3', fontWeight: 'bold' }}>
              🤖 AI is preparing to respond...
            </div>
          )}
        </ContextSection>

        {contextSubmitted && (
          <ConversationSection>
            <ConversationHeader>
              <SectionTitle>Assessment Simulation</SectionTitle>
            </ConversationHeader>
            
            <ConversationArea>
              {conversation
                .filter(message => message.role !== 'system')
                .map((message, index) => (
                <Message key={index} isUser={message.role === 'user'}>
                  <MessageLabel>
                    {message.role === 'user' ? 'You' : 'AI Assessor'}
                  </MessageLabel>
                  <MessageContent>{message.content}</MessageContent>
                </Message>
              ))}
              
              {isLoading && (
                <LoadingMessage>AI is thinking...</LoadingMessage>
              )}
            </ConversationArea>

            <InputSection>
              <MessageInput
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                placeholder="Type your message here..."
                disabled={isLoading}
                onKeyPress={(e) => e.key === 'Enter' && handleMessageSubmit(e)}
              />
              <SendButton 
                onClick={handleMessageSubmit} 
                disabled={!currentMessage.trim() || isLoading}
              >
                Send
              </SendButton>
            </InputSection>
          </ConversationSection>
        )}

        {/* Feedback Table */}
        {feedbackData && (
          <FeedbackTable>
            <TableHeader isSatisfactory={feedbackData.isSatisfactory}>
              Assessment Result: {feedbackData.result}
            </TableHeader>
            <Table>
              <thead>
                <TableHeaderRow>
                  <TableHeaderCell>Point</TableHeaderCell>
                  <TableHeaderCell>Explanation</TableHeaderCell>
                </TableHeaderRow>
              </thead>
              <tbody>
                {feedbackData.points.map((point, index) => (
                  <TableRow key={index}>
                    <PointCell>{point}</PointCell>
                    <ExplanationCell>
                      {feedbackData.explanations[index] || 'No explanation provided'}
                    </ExplanationCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>
            <ExportButton onClick={exportToExcel}>
              <ExportIcon>📊</ExportIcon>
              Export to Excel
            </ExportButton>
          </FeedbackTable>
        )}
      </ChatContainer>
    </Container>
  );
}
