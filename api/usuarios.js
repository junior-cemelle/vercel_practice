// api/usuarios.js
import supabase from '../lib/supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  const { method, query } = req;

  // GET - Obtener uno o todos
  if (method === 'GET') {
    if (query.id) {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', parseInt(query.id))
        .single();

      if (error || !data) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      return res.status(200).json(data);
    }

    const { data, error } = await supabase.from('usuarios').select('*');

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  // POST - Crear nuevo usuario
  if (method === 'POST') {
    const { nombre, email, edad } = req.body;

    if (!nombre || !email || !edad) {
      return res.status(400).json({ error: 'Faltan campos: nombre, email, edad' });
    }

    const { data, error } = await supabase
      .from('usuarios')
      .insert([{ nombre, email, edad }])
      .select();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data[0]);
  }

  // PUT - Actualizar usuario por ?id=N
  if (method === 'PUT') {
    if (!query.id) {
      return res.status(400).json({ error: 'Se requiere ?id=N en la URL' });
    }

    const { nombre, email, edad } = req.body;

    if (!nombre && !email && !edad) {
      return res.status(400).json({ error: 'Envía al menos un campo para actualizar' });
    }

    // Solo incluir en el update los campos que llegaron
    const campos = {};
    if (nombre) campos.nombre = nombre;
    if (email)  campos.email  = email;
    if (edad)   campos.edad   = edad;

    const { data, error } = await supabase
      .from('usuarios')
      .update(campos)
      .eq('id', parseInt(query.id))
      .select();

    if (error) return res.status(500).json({ error: error.message });
    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    return res.status(200).json(data[0]);
  }

  // DELETE - Eliminar usuario por ?id=N
  if (method === 'DELETE') {
    if (!query.id) {
      return res.status(400).json({ error: 'Se requiere ?id=N en la URL' });
    }

    const { data, error } = await supabase
      .from('usuarios')
      .delete()
      .eq('id', parseInt(query.id))
      .select();

    if (error) return res.status(500).json({ error: error.message });
    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    return res.status(200).json({ mensaje: 'Usuario eliminado', usuario: data[0] });
  }

  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
  res.status(405).json({ error: `Método ${method} no permitido` });
}