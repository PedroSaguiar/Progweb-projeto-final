"use client" 

import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function FormSalas() {
  const [nomeSala, setNomeSala] = useState<string>('')
  const [capacidade, setCapacidade] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [message, setMessage] = useState<string>('')

  // Função para lidar com o envio do formulário
  const handleCadastrarSala = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    // Inserindo os dados na tabela 'salas'
    const { error } = await supabase
      .from('salas')
      .insert([
        { 
          nome_sala: nomeSala, 
          capacidade: capacidade ? parseInt(capacidade, 10) : null 
        }
      ])

    if (error) {
      setMessage(`Erro ao cadastrar sala: ${error.message}`)
    } else {
      setMessage('Sala cadastrada com sucesso!')
      setNomeSala('')
      setCapacidade('')
    }
    setLoading(false)
  }

  return (
    <div style={{ maxWidth: '500px', margin: '20px auto', padding: '30px', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
      <h3 style={{ textAlign: 'center', marginBottom: '15px', color: '#383621' }}>Cadastrar Nova Sala</h3>
      
      <form onSubmit={handleCadastrarSala}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Nome da Sala:</label>
          <input
            type="text"
            value={nomeSala}
            onChange={(e) => setNomeSala(e.target.value)}
            placeholder="Ex: Sala 01"
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #9E9A6F', borderRadius: '4px', color: '#000' }}
            required
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Capacidade (Nº de alunos):</label>
          <input
            type="number"
            value={capacidade}
            onChange={(e) => setCapacidade(e.target.value)}
            placeholder="Ex: 40"
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #9E9A6F', borderRadius: '4px', color: '#000' }}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#C5BE6A',
            color: '#383621',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold'
          }}
        >
          {loading ? 'Cadastrando...' : 'Cadastrar Sala'}
        </button>
      </form>

      {message && (
        <p style={{ marginTop: '15px', textAlign: 'center', fontWeight: 'bold', color: message.includes('Erro') ? 'red' : 'green' }}>
          {message}
        </p>
      )}
    </div>
  )
}