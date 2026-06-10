"use client"

import { useState, useEffect } from 'react'
import { Session } from '@supabase/supabase-js' 
import { supabase } from '../lib/supabaseClient' 
import FormLogin from '../components/FormLogin'
import FormSalas from '../components/FormSalas'
import FormReservas from '../components/FormReservas'
import ListaReservas from '../components/ListaReservas'

export default function HomePage() {
  
  const [session, setSession] = useState<Session | null>(null)
  const [activeTab, setActiveTab] = useState<'reservas' | 'salas'>('reservas')

  useEffect(() => {
    // Verifica sessão atual ao carregar a página
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  // Se não houver sessão ativa, trava o usuário na tela de Login
  if (!session) {
    return (
      <main style={{ minHeight: '100vh', backgroundColor: '#383621', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <FormLogin />
      </main>
    )
  }

  // Se houver sessão, renderiza o Dashboard principal
  return (
    <main style={{ 
      minHeight: '100vh', 
      backgroundColor: '#706F62',
      color: '#ffffff'
    }}>
      {/* Header com informações do usuário e botão Logout */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 40px', backgroundColor: '#383621', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
        <h2 style={{ margin: 0, color: '#C5BE6A' }}>ReservaSalas</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          
          <span style={{ fontSize: '14px', color: '#9E9A6F' }}>{session.user.email}</span>
          <button 
            onClick={handleLogout}
            style={{ padding: '8px 16px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Sair
          </button>
        </div>
      </header>

      {/* Navegação por Abas para alternar os componentes */}
      <nav style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '30px' }}>
        <button 
          onClick={() => setActiveTab('reservas')}
          style={{ 
            padding: '10px 20px', 
            cursor: 'pointer', 
            border: 'none', 
            borderBottom: activeTab === 'reservas' ? '3px solid #C5BE6A' : '3px solid transparent', 
            backgroundColor: 'transparent', 
            fontWeight: 'bold', 
            color: activeTab === 'reservas' ? '#C5BE6A' : '#9E9A6F',
            transition: 'all 0.3s ease' // Adicionei uma transição suave ao clicar
          }}
        >
          📅 Reservas e Mural
        </button>
        <button 
          onClick={() => setActiveTab('salas')}
          style={{ 
            padding: '10px 20px', 
            cursor: 'pointer', 
            border: 'none', 
            borderBottom: activeTab === 'salas' ? '3px solid #C5BE6A' : '3px solid transparent', 
            backgroundColor: 'transparent', 
            fontWeight: 'bold', 
            color: activeTab === 'salas' ? '#C5BE6A' : '#9E9A6F',
            transition: 'all 0.3s ease'
          }}
        >
          🚪 Gerenciar Salas
        </button>
      </nav>

      {/* Renderização Condicional do conteúdo das abas */}
      <section style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        {activeTab === 'reservas' ? (
          <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-start' }}>
            <FormReservas />
            <ListaReservas />
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <FormSalas />
          </div>
        )}
      </section>
    </main>
  )
}