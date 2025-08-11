#!/bin/bash

# Script pour optimiser les images du projet

echo "🖼️ Optimisation des images..."

# Vérifie si les outils sont installés
if ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick n'est pas installé. Installation avec: brew install imagemagick"
    exit 1
fi

if ! command -v cwebp &> /dev/null; then
    echo "❌ cwebp n'est pas installé. Installation avec: brew install webp"
    exit 1
fi

# Répertoires
INPUT_DIR="public/images"
OUTPUT_DIR="public/images/optimized"

# Créer le répertoire de sortie
mkdir -p "$OUTPUT_DIR"

# Fonction pour optimiser une image
optimize_image() {
    local input_file="$1"
    local filename=$(basename "$input_file")
    local name="${filename%.*}"
    
    echo "📸 Traitement de $filename..."
    
    # Redimensionner et optimiser en PNG (max 1920px de large)
    convert "$input_file" \
        -resize '1920x>' \
        -quality 85 \
        -strip \
        "$OUTPUT_DIR/${name}-optimized.png"
    
    # Convertir en WebP
    cwebp -q 85 "$OUTPUT_DIR/${name}-optimized.png" \
        -o "$OUTPUT_DIR/${name}.webp"
    
    # Créer une version mobile (max 768px)
    convert "$input_file" \
        -resize '768x>' \
        -quality 85 \
        -strip \
        "$OUTPUT_DIR/${name}-mobile.png"
    
    cwebp -q 85 "$OUTPUT_DIR/${name}-mobile.png" \
        -o "$OUTPUT_DIR/${name}-mobile.webp"
    
    # Afficher les tailles
    echo "  ✅ Original: $(du -h "$input_file" | cut -f1)"
    echo "  ✅ Optimized PNG: $(du -h "$OUTPUT_DIR/${name}-optimized.png" | cut -f1)"
    echo "  ✅ WebP: $(du -h "$OUTPUT_DIR/${name}.webp" | cut -f1)"
    echo "  ✅ Mobile WebP: $(du -h "$OUTPUT_DIR/${name}-mobile.webp" | cut -f1)"
}

# Optimiser toutes les images PNG et JPG
for img in "$INPUT_DIR"/*.{png,jpg,jpeg}; do
    if [ -f "$img" ]; then
        optimize_image "$img"
    fi
done

echo "✨ Optimisation terminée!"
echo "📦 Images optimisées dans: $OUTPUT_DIR"