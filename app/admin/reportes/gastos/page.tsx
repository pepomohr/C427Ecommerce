"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { ArrowLeft, Plus, Trash2, Loader2 } from "lucide-react"
import Link from "next/link"
import type { Expense } from "@/lib/types"

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)

  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")

  useEffect(() => {
    loadExpenses()
  }, [])

  async function loadExpenses() {
    const supabase = createClient()
    const { data, error } = await supabase.from("expenses").select("*").order("created_at", { ascending: false })

    if (data && !error) {
      setExpenses(data)
    }
    setIsLoading(false)
  }

  async function handleAddExpense(e: React.FormEvent) {
    e.preventDefault()
    setIsAdding(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.from("expenses").insert({
        description,
        amount: Number.parseFloat(amount),
        category: category || null,
      })

      if (error) throw error

      setDescription("")
      setAmount("")
      setCategory("")
      loadExpenses()
    } catch (error) {
      console.error("[v0] Error adding expense:", error)
    } finally {
      setIsAdding(false)
    }
  }

  async function handleDeleteExpense(id: string) {
    if (!confirm("¿Estás seguro de que deseas eliminar este gasto?")) return

    const supabase = createClient()
    const { error } = await supabase.from("expenses").delete().eq("id", id)

    if (!error) {
      loadExpenses()
    }
  }

  const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0)

  return (
    <div className="flex min-h-screen flex-col">
      <Header isAuthenticated={true} isAdmin={true} />

      <main className="flex-1">
        <div className="container px-4 md:px-6 py-8 md:py-12">
          <Button variant="ghost" asChild className="mb-6">
            <Link href="/admin/reportes">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a reportes
            </Link>
          </Button>

          <h1 className="text-3xl md:text-4xl font-bold mb-8">Gestión de Gastos</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Add Expense Form */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Agregar Gasto</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddExpense} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="description">Descripción *</Label>
                      <Input
                        id="description"
                        required
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Ej: Compra de insumos"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="amount">Monto (ARS) *</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        required
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="1500.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Categoría</Label>
                      <Input
                        id="category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        placeholder="Ej: Insumos, Marketing"
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={isAdding}>
                      {isAdding ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Agregando...
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Agregar Gasto
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Total de Gastos</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-destructive">${totalExpenses.toLocaleString("es-AR")}</p>
                  <p className="text-sm text-muted-foreground mt-1">{expenses.length} registros</p>
                </CardContent>
              </Card>
            </div>

            {/* Expenses List */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Historial de Gastos</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-8 text-muted-foreground">Cargando gastos...</div>
                  ) : expenses.length > 0 ? (
                    <div className="space-y-3">
                      {expenses.map((expense) => (
                        <div key={expense.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium">{expense.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              {expense.category && (
                                <span className="text-xs px-2 py-1 rounded-md bg-muted">{expense.category}</span>
                              )}
                              <span className="text-xs text-muted-foreground">
                                {new Date(expense.created_at).toLocaleDateString("es-AR", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <p className="font-semibold text-destructive">${expense.amount.toLocaleString("es-AR")}</p>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteExpense(expense.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No hay gastos registrados. Agrega tu primer gasto usando el formulario.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
