import React, { useState } from 'react'
import './App.css'

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

interface OKRResponse {
  score: number;
  feedback: string;
  criteria: CriteriaDetail;
  suggestions: string[];
  // 🔥 AÑADIR CAMPOS DEBUG
  debug_ai_response?: string;
  debug_parsed?: any;
}

function App(): JSX.Element {
  const [objective, setObjective] = useState<string>('')
  const [evaluation, setEvaluation] = useState<OKRResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const evaluateOKR = async (): Promise<void> => {
    if (!objective.trim()) {
      setError('Por favor, ingresa un objetivo')
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/v1/okrs/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ objective: objective.trim() })
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      
      // El backend devuelve el JSON del modelo directamente
      // Solo necesitamos asignarlo y mostrarlo
      setEvaluation(result)
    } catch (err) {
      console.error('Error evaluating OKR:', err)
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

  return (
    <div className="App">
      <header className="App-header">
        <h1>OKR Evaluator</h1>
        <p>Evalúa tus objetivos con IA</p>
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
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="button-group">
            <button 
              onClick={evaluateOKR} 
              disabled={loading || !objective.trim()}
              className="primary-button"
            >
              {loading ? 'Evaluando...' : 'Evaluar OKR'}
            </button>
            
            {(evaluation || error) && (
              <button 
                onClick={resetForm}
                className="secondary-button"
                disabled={loading}
              >
                Nuevo Objetivo
              </button>
            )}
          </div>
        </div>

        {evaluation && (
          <div className="evaluation-result">
            {/* 🔥 DEBUG PANEL - RESPUESTA CRUDA DEL MODELO */}
            {evaluation.debug_ai_response && (
              <div className="debug-panel">
                <details>
                  <summary style={{cursor: 'pointer', padding: '10px', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '4px', marginBottom: '20px'}}>
                    🔍 DEBUG: Ver respuesta cruda del modelo (click para expandir)
                  </summary>
                  <div style={{background: '#f9fafb', padding: '15px', border: '1px solid #e5e7eb', borderRadius: '8px', marginBottom: '20px'}}>
                    <h5>Respuesta original de la IA:</h5>
                    <pre style={{background: '#fff', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '12px', overflow: 'auto', maxHeight: '300px'}}>
                      {evaluation.debug_ai_response}
                    </pre>
                    
                    {evaluation.debug_parsed && (
                      <>
                        <h5 style={{marginTop: '15px'}}>JSON parseado:</h5>
                        <pre style={{background: '#fff', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '12px', overflow: 'auto', maxHeight: '200px'}}>
                          {JSON.stringify(evaluation.debug_parsed, null, 2)}
                        </pre>
                      </>
                    )}
                  </div>
                </details>
              </div>
            )}

            <h3>Resultado de la Evaluación</h3>
            
            <div className="score-container">
              <div className="score">
                <span className="score-value">{evaluation.score}</span>
                <span className="score-max">/10</span>
              </div>
            </div>

            <div className="feedback">
              <h4>Evaluación General:</h4>
              <p className="feedback-general">{evaluation.feedback}</p>
            </div>

            {/* 🔥 DEBUG: Mostrar si tenemos criterios */}
            {evaluation.criteria ? (
              <div className="criteria-section">
                <h4>Análisis SMART:</h4>
                <div className="criteria-grid">
                  <div className="criteria-item">
                    <div className="criteria-header">
                      <span className="criteria-name">Específico</span>
                      <span className="criteria-score">{evaluation.criteria.specific?.score || 0}/10</span>
                    </div>
                    <p className="criteria-comment">{evaluation.criteria.specific?.comment || "Sin comentario"}</p>
                  </div>
                  
                  <div className="criteria-item">
                    <div className="criteria-header">
                      <span className="criteria-name">Medible</span>
                      <span className="criteria-score">{evaluation.criteria.measurable?.score || 0}/10</span>
                    </div>
                    <p className="criteria-comment">{evaluation.criteria.measurable?.comment || "Sin comentario"}</p>
                  </div>
                  
                  <div className="criteria-item">
                    <div className="criteria-header">
                      <span className="criteria-name">Alcanzable</span>
                      <span className="criteria-score">{evaluation.criteria.achievable?.score || 0}/10</span>
                    </div>
                    <p className="criteria-comment">{evaluation.criteria.achievable?.comment || "Sin comentario"}</p>
                  </div>
                  
                  <div className="criteria-item">
                    <div className="criteria-header">
                      <span className="criteria-name">Relevante</span>
                      <span className="criteria-score">{evaluation.criteria.relevant?.score || 0}/10</span>
                    </div>
                    <p className="criteria-comment">{evaluation.criteria.relevant?.comment || "Sin comentario"}</p>
                  </div>
                  
                  <div className="criteria-item">
                    <div className="criteria-header">
                      <span className="criteria-name">Temporal</span>
                      <span className="criteria-score">{evaluation.criteria.timebound?.score || 0}/10</span>
                    </div>
                    <p className="criteria-comment">{evaluation.criteria.timebound?.comment || "Sin comentario"}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{background: '#fee', padding: '10px', border: '1px solid #f88', borderRadius: '4px', marginBottom: '20px'}}>
                ⚠️ No se recibieron criterios SMART del backend
              </div>
            )}

            {/* 🔥 DEBUG: Mostrar si tenemos sugerencias */}
            {evaluation.suggestions && evaluation.suggestions.length > 0 ? (
              <div className="suggestions">
                <h4>Sugerencias de mejora:</h4>
                <ul>
                  {evaluation.suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div style={{background: '#ffe', padding: '10px', border: '1px solid #ff8', borderRadius: '4px'}}>
                ⚠️ No se recibieron sugerencias del backend
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default App