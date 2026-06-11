<script setup>
import { ref, onMounted, computed } from 'vue'
import { obtenerLibros } from '../services/librosService'
import '../styles/catalogo.css'

const usuario = JSON.parse(
  localStorage.getItem('usuario')
)

const libros = ref([])
const busqueda = ref('')

onMounted(async () => {
  libros.value = await obtenerLibros()
})

const librosFiltrados = computed(() => {
  return libros.value.filter(libro =>
    libro.titulo
      .toLowerCase()
      .includes(busqueda.value.toLowerCase())
  )
})
</script>

<template>
  <div class="catalogo-page">

    <header class="topbar">

      <div>
        <h1>📚 Biblioteca Digital</h1>
      </div>

      <div class="usuario-box">
        <span>{{ usuario.nombre }}</span>
      </div>

    </header>

    <div class="catalogo-card">

      <div class="catalogo-header">
        <h2>Catálogo de Libros</h2>

        <input
          class="search-input"
          v-model="busqueda"
          placeholder="Buscar libro..."
        />
      </div>

      <table>

        <thead>
          <tr>
            <th>Título</th>
            <th>Autor</th>
            <th>Género</th>
            <th>Stock</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="libro in librosFiltrados"
            :key="libro.id"
          >
            <td>{{ libro.titulo }}</td>
            <td>{{ libro.autor }}</td>
            <td>{{ libro.genero }}</td>
            <td>{{ libro.stock }}</td>
          </tr>
        </tbody>

      </table>

    </div>

  </div>
</template>

