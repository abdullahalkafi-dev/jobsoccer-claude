/**
 * People's names: any letter (with accents, ñ, œ ...), combining marks, straight and curly
 * apostrophes, space, dot, hyphen and the Catalan middle dot (l·l). Used by the model AND the DTOs
 * so they always agree.
 */
export const NAME_REGEX = /^[\p{L}\p{M}'’ .\-·]+$/u;
