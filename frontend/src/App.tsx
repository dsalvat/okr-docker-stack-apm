import React, { useState } from 'react'
import './App.css'

// Interfaces que coinciden EXACTAMENTE con el backend
interface CriteriaScore {
  score: number;
  comment: string;
}

interface CriteriaDetail {
  specific: CriteriaScore;
  measurable: CriteriaScore;
  achievable: CriteriaScore;
  relevant: CriteriaScore;
  timebound: CriteriaScore;
}

interface OKRBreakdown {
  clarity: number;
  focus: number;
  writing: number;
}

interface OKRResponse {
  // Campos principales
  score: number;
  feedback: string;
  criteria: CriteriaDetail;
  suggestions: string[];
  
  // Debug fields (✅ RESUELVE EL ERROR TYPESCRIPT)
  debug_ai_response?: string;
  debug_parsed?: any;
  
  // Metadata
  okr_id?: string;
  model_used?: string;
  timestamp?: string;
  status?: string;
  
  // Legacy data
  breakdown?: OKRBreakdown;
  can_add_krs?: boolean;
}

function App(): JSX.Element {
  const [objective, setObjective] = useState<string>('')
  const [evaluation, setEvaluation] = useState<OKRResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [debugMode, setDebugMode] = useState<boolean>(false)

  const evaluateOKR = async (): Promise<void> => {
    if (!objective.trim()) {
      setError('Por favor, ingresa un objetivo')
      return
    }

    setLoading(true)
    setError(null)
    
    console.log('🚀 Iniciando evaluación de OKR:', objective.trim())
    
    try {
      const requestBody = { objective: objective.trim() }
      console.log('📤 Request body:', requestBody)
      
      const response = await fetch('/api/v1/okrs/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      console.log('📥 Response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Response error:', errorText)
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const result: OKRResponse = await response.json()
      console.log('✅ Response data:', result)
      
      // Validación básica de la respuesta
      if (!result || typeof result.score !== 'number') {
        console.warn('⚠️ Respuesta inesperada del backend:', result)
        throw new Error('Respuesta inválida del servidor')
      }
      
      setEvaluation(result)
      
      // Analytics opcional
      if ((window as any).gtag) {
        (window as any).gtag('event', 'okr_evaluated', {
          score: result.score,
          has_suggestions: result.suggestions?.length > 0
        });
      }
      
    } catch (err) {
      console.error('💥 Error evaluating OKR:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = (): void => {
    setObjective('')
    setEvaluation(null)
    setError(null)
  }

  const getScoreColor = (score: number): string => {
    if (score >= 8) return '#22c55e'  // Verde
    if (score >= 6) return '#f59e0b'  // Amarillo
    return '#ef4444'  // Rojo
  }

  const getScoreEmoji = (score: number): string => {
    if (score >= 8) return '🎯'
    if (score >= 6) return '⚡'
    return '🔄'
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>🎯 OKR Evaluator</h1>
        <p>Evalúa tus objetivos con IA avanzada</p>
        
        {/* Toggle debug mode */}
        <div style={{position: 'absolute', top: '10px', right: '10px'}}>
          <label style={{fontSize: '12px', color: '#666', cursor: 'pointer'}}>
            <input 
              type="checkbox" 
              checked={debugMode} 
              onChange={(e) => setDebugMode(e.target.checked)}
              style={{marginRight: '5px'}}
            />
            Debug Mode
          </label>
        </div>
      </header>

      <main className="App-main">
        <div className="form-container">
          <div className="input-group">
            <label htmlFor="objective-input">
              Describe tu objetivo (OKR):
            </label>
            <textarea
              id="objective-input"
              value={objective}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                setObjective(e.target.value)
              }
              placeholder="Ejemplo: Aumentar las ventas en un 25% durante el Q4 2024"
              rows={4}
              disabled={loading}
              className={error ? 'error' : ''}
            />
            <div style={{fontSize: '12px', color: '#666', marginTop: '5px'}}>
              {objective.length}/500 caracteres
            </div>
          </div>

          {error && (
            <div className="error-message">
              ❌ {error}
            </div>
          )}

          <div className="button-group">
            <button 
              onClick={evaluateOKR} 
              disabled={loading || !objective.trim()}
              className="primary-button"
            >
              {loading ? '🔄 Evaluando...' : '🚀 Evaluar OKR'}
            </button>
            
            {(evaluation || error) && (
              <button 
                onClick={resetForm}
                className="secondary-button"
                disabled={loading}
              >
                ✨ Nuevo Objetivo
              </button>
            )}
          </div>
        </div>

        {evaluation && (
          <div className="evaluation-result">
            {/* DEBUG PANEL COMPLETO */}
            {debugMode && (
              <div className="debug-panel" style={{marginBottom: '20px'}}>
                <details style={{marginBottom: '15px'}}>
                  <summary style={{
                    cursor: 'pointer', 
                    padding: '12px', 
                    background: '#f8fafc', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    color: '#1e293b'
                  }}>
                    🔍 DEBUG INFO (click para expandir)
                  </summary>
                  
                  <div style={{
                    background: '#f1f5f9', 
                    padding: '16px', 
                    border: '1px solid #cbd5e1', 
                    borderRadius: '8px', 
                    marginTop: '8px'
                  }}>
                    {/* Metadata */}
                    <div style={{marginBottom: '16px'}}>
                      <h5 style={{margin: '0 0 8px 0', color: '#475569'}}>📊 Metadata:</h5>
                      <div style={{
                        background: '#ffffff', 
                        padding: '12px', 
                        borderRadius: '6px', 
                        fontSize: '13px', 
                        fontFamily: 'monospace'
                      }}>
                        <div><strong>ID:</strong> {evaluation.okr_id || 'N/A'}</div>
                        <div><strong>Modelo:</strong> {evaluation.model_used || 'N/A'}</div>
                        <div><strong>Timestamp:</strong> {evaluation.timestamp || 'N/A'}</div>
                        <div><strong>Status:</strong> {evaluation.status || 'N/A'}</div>
                        <div><strong>Can add KRs:</strong> {evaluation.can_add_krs ? '✅ Sí' : '❌ No'}</div>
                      </div>
                    </div>

                    {/* Legacy breakdown */}
                    {evaluation.breakdown && (
                      <div style={{marginBottom: '16px'}}>
                        <h5 style={{margin: '0 0 8px 0', color: '#475569'}}>📈 Breakdown Legacy:</h5>
                        <div style={{
                          background: '#ffffff', 
                          padding: '12px', 
                          borderRadius: '6px', 
                          fontSize: '13px', 
                          fontFamily: 'monospace'
                        }}>
                          <div><strong>Clarity:</strong> {evaluation.breakdown.clarity}/10</div>
                          <div><strong>Focus:</strong> {evaluation.breakdown.focus}/10</div>
                          <div><strong>Writing:</strong> {evaluation.breakdown.writing}/10</div>
                        </div>
                      </div>
                    )}
                    
                    {/* Raw AI Response */}
                    {evaluation.debug_ai_response && (
                      <div style={{marginBottom: '16px'}}>
                        <h5 style={{margin: '0 0 8px 0', color: '#475569'}}>🤖 Respuesta cruda de IA:</h5>
                        <pre style={{
                          background: '#ffffff', 
                          padding: '12px', 
                          border: '1px solid #e2e8f0', 
                          borderRadius: '6px', 
                          fontSize: '11px', 
                          overflow: 'auto', 
                          maxHeight: '200px',
                          margin: '0'
                        }}>
                          {evaluation.debug_ai_response}
                        </pre>
                      </div>
                    )}
                    
                    {/* Parsed JSON */}
                    {evaluation.debug_parsed && (
                      <div>
                        <h5 style={{margin: '0 0 8px 0', color: '#475569'}}>🔧 JSON parseado:</h5>
                        <pre style={{
                          background: '#ffffff', 
                          padding: '12px', 
                          border: '1px solid #e2e8f0', 
                          borderRadius: '6px', 
                          fontSize: '11px', 
                          overflow: 'auto', 
                          maxHeight: '200px',
                          margin: '0'
                        }}>
                          {JSON.stringify(evaluation.debug_parsed, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              </div>
            )}

            {/* HEADER DE RESULTADO */}
            <div style={{textAlign: 'center', marginBottom: '30px'}}>
              <h3>
                {getScoreEmoji(evaluation.score)} Resultado de la Evaluación
              </h3>
              
              <div className="score-container" style={{marginBottom: '20px'}}>
                <div className="score">
                  <span 
                    className="score-value" 
                    style={{color: getScoreColor(evaluation.score)}}
                  >
                    {evaluation.score.toFixed(1)}
                  </span>
                  <span className="score-max">/10</span>
                </div>
              </div>

              {evaluation.can_add_krs && (
                <div style={{
                  background: '#dcfce7', 
                  color: '#166534', 
                  padding: '8px 16px', 
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  ✅ Este objetivo está listo para añadir Key Results
                </div>
              )}
            </div>

            {/* FEEDBACK GENERAL */}
            <div className="feedback" style={{marginBottom: '30px'}}>
              <h4>💬 Evaluación General:</h4>
              <div style={{
                background: '#f8fafc',
                padding: '16px',
                borderRadius: '8px',
                borderLeft: '4px solid #3b82f6'
              }}>
                <p className="feedback-general" style={{margin: '0', lineHeight: '1.6'}}>
                  {evaluation.feedback}
                </p>
              </div>
            </div>

            {/* ANÁLISIS SMART DETALLADO */}
            {evaluation.criteria ? (
              <div className="criteria-section" style={{marginBottom: '30px'}}>
                <h4>🎯 Análisis SMART Detallado:</h4>
                <div className="criteria-grid" style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '16px'
                }}>
                  {Object.entries(evaluation.criteria).map(([key, criterion]) => (
                    <div key={key} style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '16px'
                    }}>
                      <div className="criteria-header" style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '12px'
                      }}>
                        <span className="criteria-name" style={{
                          fontWeight: '600',
                          color: '#1e293b'
                        }}>
                          {key === 'specific' ? '🎯 Específico' :
                           key === 'measurable' ? '📊 Medible' :
                           key === 'achievable' ? '🚀 Alcanzable' :
                           key === 'relevant' ? '💡 Relevante' :
                           key === 'timebound' ? '⏰ Temporal' : key}
                        </span>
                        <span 
                          className="criteria-score"
                          style={{
                            fontWeight: 'bold',
                            fontSize: '18px',
                            color: getScoreColor(criterion?.score ?? 0)
                          }}
                        >
                          {(criterion?.score ?? 0).toFixed(1)}/10
                        </span>
                      </div>
                      <p className="criteria-comment" style={{
                        margin: '0',
                        color: '#64748b',
                        fontSize: '14px',
                        lineHeight: '1.5'
                      }}>
                        {criterion?.comment || "Sin comentario disponible"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{
                background: '#fef2f2', 
                border: '1px solid #fecaca',
                color: '#dc2626',
                padding: '12px', 
                borderRadius: '8px', 
                marginBottom: '20px'
              }}>
                ⚠️ No se recibieron criterios SMART del backend
                {debugMode && (
                  <details style={{marginTop: '10px'}}>
                    <summary style={{cursor: 'pointer', fontSize: '12px'}}>
                      Ver estructura recibida
                    </summary>
                    <pre style={{fontSize: '11px', marginTop: '8px', overflow: 'auto'}}>
                      {JSON.stringify(evaluation, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {/* SUGERENCIAS DE MEJORA */}
            {evaluation.suggestions && evaluation.suggestions.length > 0 ? (
              <div className="suggestions" style={{marginBottom: '20px'}}>
                <h4>💡 Sugerencias de Mejora ({evaluation.suggestions.length}):</h4>
                <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                  {evaluation.suggestions.map((suggestion, index) => (
                    <div key={index} style={{
                      background: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      borderRadius: '8px',
                      padding: '14px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px'
                    }}>
                      <span style={{
                        background: '#22c55e',
                        color: 'white',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        flexShrink: 0
                      }}>
                        {index + 1}
                      </span>
                      <span style={{color: '#166534', lineHeight: '1.5'}}>
                        {suggestion}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{
                background: '#fffbeb', 
                border: '1px solid #fed7aa',
                color: '#ea580c',
                padding: '12px', 
                borderRadius: '8px'
              }}>
                ⚠️ No se recibieron sugerencias del backend
                {debugMode && (
                  <div style={{marginTop: '8px', fontSize: '12px'}}>
                    Tipo de suggestions: {typeof evaluation.suggestions}<br/>
                    Valor: {JSON.stringify(evaluation.suggestions)}
                  </div>
                )}
              </div>
            )}

            {/* PIE DE PÁGINA CON INFO ADICIONAL */}
            <div style={{
              marginTop: '30px',
              padding: '16px',
              background: '#f8fafc',
              borderRadius: '8px',
              fontSize: '13px',
              color: '#64748b'
            }}>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px'}}>
                <div>
                  <strong>📅 Evaluado:</strong><br/>
                  {evaluation.timestamp ? new Date(evaluation.timestamp).toLocaleString('es-ES') : 'N/A'}
                </div>
                <div>
                  <strong>🔗 ID Evaluación:</strong><br/>
                  <code style={{fontSize: '11px'}}>{evaluation.okr_id || 'N/A'}</code>
                </div>
                <div>
                  <strong>🤖 Modelo IA:</strong><br/>
                  {evaluation.model_used || 'N/A'}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App