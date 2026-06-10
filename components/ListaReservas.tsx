"use client"

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'


interface Reserva {
  id: number
  usuario_id: string 
  data_inicio: string
  data_fim: string
  salas: {
    nome_sala: string
  }
  perfis: {
    nome_exibicao: string
  }
}

export default function ListaReservas() {
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [usuarioLogadoId, setUsuarioLogadoId] = useState<string | null>(null)

  useEffect(() => {
    async function carregarDados() {
      // 1. Descobre quem é o usuário que está acessando a tela agora
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUsuarioLogadoId(user.id)
      }

      // 2. Busca as reservas trazendo também o usuario_id para comparação
      const { data, error } = await supabase
        .from('reservas')
        .select(`
          id,
          usuario_id,
          data_inicio,
          data_fim,
          salas ( nome_sala ),
          perfis ( nome_exibicao )
        `)
        .order('data_inicio', { ascending: true })

      if (!error && data) {
        setReservas(data as unknown as Reserva[])
      }
      setLoading(false)
    }

    carregarDados()
  }, [])

  // Função para deletar a reserva no banco de dados
  const handleCancelarReserva = async (reservaId: number) => {
    const confirmar = window.confirm("Tem certeza que deseja cancelar esta reserva?")
    if (!confirmar) return

    const { error } = await supabase
      .from('reservas')
      .delete()
      .eq('id', reservaId) 

    if (error) {
      alert(`Erro ao cancelar: ${error.message}`)
    } else {
      // Atualiza a tela instantaneamente removendo a reserva cancelada da lista
      setReservas(reservas.filter((r) => r.id !== reservaId))
      alert("Reserva cancelada com sucesso!")
    }
  }

  const formatarData = (dataIso: string) => {
    const data = new Date(dataIso)
    return data.toLocaleString('pt-BR', { 
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' 
    })
  }

  return (
    <div style={{ maxWidth: '600px', margin: '20px auto', padding: '20px', backgroundColor: '#ffffff', borderRadius: '8px', border: '2px solid #383621' }}>
      <h3 style={{ textAlign: 'center', color: '#383621', marginBottom: '20px' }}>Mural de Reservas</h3>
      
      {loading ? (
        <p style={{ textAlign: 'center' }}>Carregando reservas...</p>
      ) : reservas.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#666' }}>Nenhuma sala reservada no momento.</p>
      ) : (
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {reservas.map((reserva) => (
            <li key={reserva.id} style={{ padding: '15px', borderBottom: '1px solid #9E9A6F', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              
              <div>
                <p style={{ margin: '0 0 5px 0', fontSize: '16px', color: '#333' }}>
                  👤 <strong>{reserva.perfis?.nome_exibicao || 'Usuário Desconhecido'}</strong> reservou a 
                  🚪 <strong>{reserva.salas?.nome_sala || 'Sala Removida'}</strong>
                </p>
                <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                  🕒 De: {formatarData(reserva.data_inicio)} <br/>
                  ⏳ Até: {formatarData(reserva.data_fim)}
                </p>
              </div>

              {/* A MÁGICA VISUAL ACONTECE AQUI: O botão só renderiza se os IDs forem iguais */}
              {usuarioLogadoId === reserva.usuario_id && (
                <button 
                  onClick={() => handleCancelarReserva(reserva.id)}
                  style={{ 
                    padding: '8px 12px', 
                    backgroundColor: '#dc3545', 
                    color: '#fff', 
                    border: 'none', 
                    borderRadius: '4px', 
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Cancelar
                </button>
              )}

            </li>
          ))}
        </ul>
      )}
    </div>
  )
}