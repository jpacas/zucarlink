// Importar todos los modelos
const User = require('./User')
const Pais = require('./Pais')
const Area = require('./Area')
const Ingenio = require('./Ingenio')
const Proveedor = require('./Proveedor')
const Post = require('./Post')
const Comment = require('./Comment')
const Like = require('./Like')
const Experiencia = require('./Experiencia')
const Empleo = require('./Empleo')
const Archivo = require('./Archivo')
const Maquinaria = require('./Maquinaria')
const Noticia = require('./Noticia')
const ZucarIA = require('./ZucarIA')

const setupAssociations = () => {
  // Relaciones de User
  User.belongsTo(Pais, { foreignKey: 'paisId', as: 'pais' })
  Pais.hasMany(User, { foreignKey: 'paisId' })

  User.belongsTo(Ingenio, { foreignKey: 'ingenioId', as: 'ingenio' })
  Ingenio.hasMany(User, { foreignKey: 'ingenioId' })

  User.belongsTo(Area, { foreignKey: 'areaId', as: 'area' })
  Area.hasMany(User, { foreignKey: 'areaId' })

  User.belongsTo(Proveedor, { foreignKey: 'proveedorId', as: 'proveedor' })
  Proveedor.hasMany(User, { foreignKey: 'proveedorId' })

  // Relaciones de Proveedor
  Proveedor.belongsTo(Pais, { foreignKey: 'paisId', as: 'pais' })
  Pais.hasMany(Proveedor, { foreignKey: 'paisId' })

  // Relaciones de Ingenio
  Ingenio.belongsTo(Pais, { foreignKey: 'paisId', as: 'pais' })
  Pais.hasMany(Ingenio, { foreignKey: 'paisId', as: 'ingenios' })

  // Relaciones de Experiencia
  Experiencia.belongsTo(User, { foreignKey: 'usuarioId', as: 'usuario' })
  User.hasMany(Experiencia, { foreignKey: 'usuarioId' })

  Experiencia.belongsTo(Ingenio, { foreignKey: 'ingenioId', as: 'ingenio' })
  Ingenio.hasMany(Experiencia, { foreignKey: 'ingenioId' })

  Experiencia.belongsTo(Area, { foreignKey: 'areaId', as: 'area' })
  Area.hasMany(Experiencia, { foreignKey: 'areaId' })

  Experiencia.belongsTo(Pais, { foreignKey: 'paisId', as: 'pais' })
  Pais.hasMany(Experiencia, { foreignKey: 'paisId' })

  // Relaciones de Post
  Post.belongsTo(User, { foreignKey: 'usuarioId', as: 'autor' })
  User.hasMany(Post, { foreignKey: 'usuarioId' })

  Post.belongsTo(Area, { foreignKey: 'areaId', as: 'area' })
  Area.hasMany(Post, { foreignKey: 'areaId' })

  // Relaciones de Comment
  Comment.belongsTo(User, { foreignKey: 'usuarioId', as: 'usuario' })
  User.hasMany(Comment, { foreignKey: 'usuarioId', as: 'comments' })

  Comment.belongsTo(Post, { foreignKey: 'postId', as: 'post' })
  Post.hasMany(Comment, { foreignKey: 'postId', as: 'comments' })

  // Relaciones de Like
  Like.belongsTo(User, { foreignKey: 'usuarioId', as: 'usuario' })
  User.hasMany(Like, { foreignKey: 'usuarioId', as: 'likes' })

  Like.belongsTo(Post, { foreignKey: 'postId', as: 'post' })
  Post.hasMany(Like, { foreignKey: 'postId', as: 'likes' })

  Like.belongsTo(Maquinaria, { foreignKey: 'maquinariaId', as: 'maquinarias' })
  Maquinaria.hasMany(Like, { foreignKey: 'maquinariaId', as: 'likes' })

  Like.belongsTo(Empleo, { foreignKey: 'empleoId', as: 'empleo' })
  Empleo.hasMany(Like, { foreignKey: 'empleoId', as: 'likes' })

  // Relaciones de Empleo
  Empleo.belongsTo(User, { foreignKey: 'usuarioId', as: 'autor' })
  User.hasMany(Empleo, { foreignKey: 'usuarioId' })

  Empleo.belongsTo(Ingenio, { foreignKey: 'ingenioId', as: 'ingenio' })
  Ingenio.hasMany(Empleo, { foreignKey: 'ingenioId' })

  Empleo.belongsTo(Area, { foreignKey: 'areaId', as: 'area' })
  Area.hasMany(Empleo, { foreignKey: 'areaId' })

  Empleo.belongsTo(Pais, { foreignKey: 'paisId', as: 'pais' })
  Pais.hasMany(Empleo, { foreignKey: 'paisId' })

  // Relaciones de Archivo
  Archivo.belongsTo(Post, { foreignKey: 'postId' })
  Post.hasMany(Archivo, {
    foreignKey: 'postId',
    as: 'archivos',
    onDelete: 'CASCADE',
  })

  Archivo.belongsTo(Empleo, { foreignKey: 'empleoId' })
  Empleo.hasMany(Archivo, {
    foreignKey: 'empleoId',
    as: 'archivos',
    onDelete: 'CASCADE',
  })

  Archivo.belongsTo(Maquinaria, {
    foreignKey: 'maquinariaId',
    as: 'maquinaria',
  })
  Maquinaria.hasMany(Archivo, {
    foreignKey: 'maquinariaId',
    as: 'archivos',
    onDelete: 'CASCADE',
  })

  Archivo.belongsTo(Noticia, { foreignKey: 'noticiaId', as: 'noticia' })
  Noticia.hasMany(Archivo, {
    foreignKey: 'noticiaId',
    as: 'archivos',
    onDelete: 'CASCADE',
  })

  // Relaciones de Maquinaria
  Maquinaria.belongsTo(User, { foreignKey: 'usuarioId', as: 'autor' })
  User.hasMany(Maquinaria, { foreignKey: 'usuarioId' })

  Maquinaria.belongsTo(Area, { foreignKey: 'areaId', as: 'area' })
  Area.hasMany(Maquinaria, { foreignKey: 'areaId' })

  Maquinaria.belongsTo(Pais, { foreignKey: 'paisId', as: 'pais' })
  Pais.hasMany(Maquinaria, { foreignKey: 'paisId' })

  // Relaciones de Noticia
  Noticia.belongsTo(User, { foreignKey: 'usuarioId', as: 'autor' })
  User.hasMany(Noticia, { foreignKey: 'usuarioId' })

  Noticia.belongsTo(Area, { foreignKey: 'areaId', as: 'area' })
  Area.hasMany(Noticia, { foreignKey: 'areaId' })

  // Relaciones de ZucarIA
  ZucarIA.belongsTo(User, { foreignKey: 'usuarioId', as: 'user' })
  User.hasMany(ZucarIA, { foreignKey: 'usuarioId', as: 'zucarIA' })
}

module.exports = setupAssociations
