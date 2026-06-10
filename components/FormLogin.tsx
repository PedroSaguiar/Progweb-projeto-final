"use client" // Obrigatório na primeira linha para componentes interativos 

import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)

  // Função para realizar o Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setMessage(`Erro no login: ${error.message}`)
    } else {
      setMessage('Login realizado com sucesso! Redirecionando...')
      
    }
    setLoading(false)
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    // 1. Cria a conta no sistema de Autenticação do Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setMessage(`Erro no cadastro: ${error.message}`)
    } else if (data.user) {
      
      // 2. Pega o ID gerado e cria a linha na tabela de perfis
      const nomeProvisorio = email.split('@')[0]

      const { error: perfilError } = await supabase
        .from('perfis')
        .insert([
          { 
            id: data.user.id, 
            nome_exibicao: nomeProvisorio,
            email: email 
          }
        ])

      if (perfilError) {
        setMessage(`Conta criada, mas erro ao salvar perfil: ${perfilError.message}`)
      } else {
        setMessage('Cadastro e perfil criados com sucesso! Você já pode reservar salas.')
        setIsRegistering(false) 
      }
    }
    setLoading(false)
  }

  return (
    <div style={{ maxWidth: '400px', width: '100%', padding: '30px', backgroundColor: '#9E9A6F', borderRadius: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.3)', color: '#383621' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '25px', color: '#383621' }}>{isRegistering ? 'Criar Conta' : 'Acessar Sistema'}</h2>
      <form onSubmit={isRegistering ? handleSignUp : handleLogin}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>E-mail:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box', color: '#000', borderRadius: '4px', border: '1px solid #383621' }}
            required
          />
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Senha:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box', color: '#000', borderRadius: '4px', border: '1px solid #383621' }}
            required
          />
        </div>

        <button 
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: '12px', backgroundColor: '#C5BE6A', color: '#383621', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', marginBottom: '15px' }}
        >
          {loading ? 'Processando...' : (isRegistering ? 'Cadastrar' : 'Entrar')}
        </button>

        <div style={{ textAlign: 'center', fontSize: '14px' }}>
          <span>{isRegistering ? 'Já tem uma conta?' : 'Não tem uma conta?'}</span>
          <button
            type="button"
            onClick={() => {
              setIsRegistering(!isRegistering)
              setMessage('') 
            }}
            style={{ background: 'none', border: 'none', color: '#383621', cursor: 'pointer', marginLeft: '5px', textDecoration: 'underline', fontWeight: 'bold' }}
          >
            {isRegistering ? 'Faça login' : 'Cadastre-se'}
          </button>
        </div>
      </form>

      {message && <p style={{ marginTop: '15px', textAlign: 'center', fontWeight: 'bold' }}>{message}</p>}
    </div>
  )
}