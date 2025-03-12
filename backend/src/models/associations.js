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
const Conversation = require('./Conversation')
const Message = require('./Message')

const setupAssociations = () => {
  // Relaciones de User
  User.belongsTo(Pais, { foreignKey: 'paisId', as: 'pais' })
  Pais.hasMany(User, { foreignKey: 'paisId', as: 'users' })

  User.belongsTo(Ingenio, { foreignKey: 'ingenioId', as: 'ingenio' })
  Ingenio.hasMany(User, { foreignKey: 'ingenioId', as: 'users' })

  User.belongsTo(Area, { foreignKey: 'areaId', as: 'area' })
  Area.hasMany(User, { foreignKey: 'areaId', as: 'users' })

  User.belongsTo(Proveedor, { foreignKey: 'proveedorId', as: 'proveedor' })
  Proveedor.hasMany(User, { foreignKey: 'proveedorId', as: 'users' })

  // Relaciones de Proveedor
  Proveedor.belongsTo(Pais, { foreignKey: 'paisId', as: 'pais' })
  Pais.hasMany(Proveedor, { foreignKey: 'paisId', as: 'proveedor' })

  // Relaciones de Ingenio
  Ingenio.belongsTo(Pais, { foreignKey: 'paisId', as: 'pais' })
  Pais.hasMany(Ingenio, { foreignKey: 'paisId', as: 'ingenios' })

  // Relaciones de Experiencia
  Experiencia.belongsTo(User, { foreignKey: 'usuarioId', as: 'usuario' })
  User.hasMany(Experiencia, { foreignKey: 'usuarioId', as: 'experiencias' })

  Experiencia.belongsTo(Ingenio, { foreignKey: 'ingenioId', as: 'ingenio' })
  Ingenio.hasMany(Experiencia, { foreignKey: 'ingenioId', as: 'experiencias' })

  Experiencia.belongsTo(Area, { foreignKey: 'areaId', as: 'area' })
  Area.hasMany(Experiencia, { foreignKey: 'areaId', as: 'experiencias' })

  Experiencia.belongsTo(Pais, { foreignKey: 'paisId', as: 'pais' })
  Pais.hasMany(Experiencia, { foreignKey: 'paisId', as: 'experiencias' })

  // Relaciones de Post
  Post.belongsTo(User, { foreignKey: 'usuarioId', as: 'autor' })
  User.hasMany(Post, { foreignKey: 'usuarioId', as: 'posts' })

  Post.belongsTo(Area, { foreignKey: 'areaId', as: 'area' })
  Area.hasMany(Post, { foreignKey: 'areaId', as: 'posts' })

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
  User.hasMany(Empleo, { foreignKey: 'usuarioId', as: 'empleos' })

  Empleo.belongsTo(Ingenio, { foreignKey: 'ingenioId', as: 'ingenio' })
  Ingenio.hasMany(Empleo, { foreignKey: 'ingenioId', as: 'empleos' })

  Empleo.belongsTo(Area, { foreignKey: 'areaId', as: 'area' })
  Area.hasMany(Empleo, { foreignKey: 'areaId', as: 'empleos' })

  Empleo.belongsTo(Pais, { foreignKey: 'paisId', as: 'pais' })
  Pais.hasMany(Empleo, { foreignKey: 'paisId', as: 'empleos' })

  // Relaciones de Archivo
  Archivo.belongsTo(Post, { foreignKey: 'postId', as: 'post' })
  Post.hasMany(Archivo, {
    foreignKey: 'postId',
    as: 'archivos',
    onDelete: 'CASCADE',
  })

  Archivo.belongsTo(Empleo, { foreignKey: 'empleoId', as: 'empleos' })
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
  User.hasMany(Maquinaria, { foreignKey: 'usuarioId', as: 'maquinarias' })

  Maquinaria.belongsTo(Area, { foreignKey: 'areaId', as: 'area' })
  Area.hasMany(Maquinaria, { foreignKey: 'areaId', as: 'maquinarias' })

  Maquinaria.belongsTo(Pais, { foreignKey: 'paisId', as: 'pais' })
  Pais.hasMany(Maquinaria, { foreignKey: 'paisId', as: 'maquinarias' })

  Maquinaria.belongsTo(Ingenio, { foreignKey: 'ingenioId', as: 'ingenio' })
  Ingenio.hasMany(Maquinaria, { foreignKey: 'ingenioId', as: 'maquinarias' })

  // Relaciones de Noticia
  Noticia.belongsTo(User, { foreignKey: 'usuarioId', as: 'autor' })
  User.hasMany(Noticia, { foreignKey: 'usuarioId', as: 'noticias' })

  Noticia.belongsTo(Area, { foreignKey: 'areaId', as: 'area' })
  Area.hasMany(Noticia, { foreignKey: 'areaId', as: 'noticias' })

  // Relaciones de ZucarIA
  ZucarIA.belongsTo(User, { foreignKey: 'usuarioId', as: 'users' })
  User.hasMany(ZucarIA, { foreignKey: 'usuarioId', as: 'zucarIA' })

  // Relaciones de Chat
  Conversation.belongsTo(User, { foreignKey: 'user1Id', as: 'user1' })
  Conversation.belongsTo(User, { foreignKey: 'user2Id', as: 'user2' })
  User.hasMany(Conversation, {
    foreignKey: 'user1Id',
    as: 'conversationsAsUser1',
  })
  User.hasMany(Conversation, {
    foreignKey: 'user2Id',
    as: 'conversationsAsUser2',
  })

  Message.belongsTo(Conversation, {
    foreignKey: 'conversationId',
    as: 'conversation',
  })
  Conversation.hasMany(Message, {
    foreignKey: 'conversationId',
    as: 'messages',
  })

  Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' })
  User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' })
}

module.exports = setupAssociations
