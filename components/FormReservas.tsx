"use client"

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'


interface Sala {
  id: number
  nome_sala: string
}

export default function FormReservas() {
  const [salas, setSalas] = useState<Sala[]>([])
  const [salaSelecionada, setSalaSelecionada] = useState<string>('')
  const [dataInicio, setDataInicio] = useState<string>('')
  const [dataFim, setDataFim] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [message, setMessage] = useState<string>('')

  // Carrega as salas do banco assim que o componente abre na tela
  useEffect(() => {
    async function carregarSalas() {
      const { data, error } = await supabase
        .from('salas')
        .select('id, nome_sala')
      
      if (!error && data) {
        setSalas(data)
      }
    }
    carregarSalas()
  }, [])

  const handleCriarReserva = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      // 1. Descobre qual é o utilizador que está autenticado no momento
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError || !user) {
        setMessage('Erro: Precisa de fazer login primeiro para reservar!')
        setLoading(false)
        return
      }

      // 2. Grava a reserva ligando o utilizador e a sala escolhida
      const { error } = await supabase
        .from('reservas')
        .insert([
          {
            sala_id: parseInt(salaSelecionada, 10),
            usuario_id: user.id, 
            data_inicio: new Date(dataInicio).toISOString(),
            data_fim: new Date(dataFim).toISOString()
          }
        ])

      if (error) {
        setMessage(`Erro ao reservar: ${error.message}`)
      } else {
        setMessage('Reserva realizada com sucesso!')
        setSalaSelecionada('')
        setDataInicio('')
        setDataFim('')
      }

    } catch (err) {
      console.error(err)
      setMessage('Ocorreu um erro interno ao processar a reserva.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '400px', width: '100%', padding: '25px', border: 'none', borderRadius: '12px', backgroundColor: '#ffffff', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
      <h3 style={{ textAlign: 'center', marginBottom: '15px', color: '#383621' }}>Reservar uma Sala</h3>
      
      <form onSubmit={handleCriarReserva}>
        {/* Seleção da Sala vinda do Banco */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: '#555' }}>Selecione a Sala:</label>
          <select
            value={salaSelecionada}
            onChange={(e) => setSalaSelecionada(e.target.value)}
            style={{ width: '100%', padding: '10px', color: '#000', borderRadius: '4px', border: '1px solid #9E9A6F' }}
            required
          >
            <option value="">-- Escolha uma sala --</option>
            {salas.map((sala) => (
              <option key={sala.id} value={sala.id}>
                {sala.nome_sala}
              </option>
            ))}
          </select>
        </div>

        {/* Data e Hora de Início */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: '#555' }}>Início da Reserva:</label>
          <input
            type="datetime-local"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            style={{ width: '100%', padding: '10px', color: '#000', borderRadius: '4px', border: '1px solid #9E9A6F' }}
            required
          />
        </div>

        {/* Data e Hora de Término */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: '#555' }}>Fim da Reserva:</label>
          <input
            type="datetime-local"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            style={{ width: '100%', padding: '10px', color: '#000', borderRadius: '4px', border: '1px solid #9E9A6F' }}
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
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Reservando...' : 'Confirmar Reserva'}
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