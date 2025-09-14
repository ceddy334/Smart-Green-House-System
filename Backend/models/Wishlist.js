const mongoose = require('mongoose');

const wishlistItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    maxlength: [200, 'Notes cannot exceed 200 characters'],
    default: ''
  }
});

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [wishlistItemSchema],
  totalItems: {
    type: Number,
    default: 0
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  name: {
    type: String,
    default: 'My Wishlist',
    maxlength: [100, 'Wishlist name cannot exceed 100 characters']
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate totals before saving
wishlistSchema.pre('save', function(next) {
  this.totalItems = this.items.length;
  this.lastUpdated = new Date();
  next();
});

// Methods
wishlistSchema.methods.addItem = function(productId, notes = '') {
  const existingItem = this.items.find(item => item.product.toString() === productId.toString());
  
  if (!existingItem) {
    this.items.push({
      product: productId,
      notes: notes
    });
    return this.save();
  }
  
  throw new Error('Item already in wishlist');
};

wishlistSchema.methods.removeItem = function(productId) {
  this.items = this.items.filter(item => item.product.toString() !== productId.toString());
  return this.save();
};

wishlistSchema.methods.updateNotes = function(productId, notes) {
  const item = this.items.find(item => item.product.toString() === productId.toString());
  if (item) {
    item.notes = notes;
    return this.save();
  }
  throw new Error('Item not found in wishlist');
};

wishlistSchema.methods.clear = function() {
  this.items = [];
  return this.save();
};

// Indexes
wishlistSchema.index({ user: 1 });
wishlistSchema.index({ 'items.product': 1 });
wishlistSchema.index({ isPublic: 1 });

module.exports = mongoose.model('Wishlist', wishlistSchema);
