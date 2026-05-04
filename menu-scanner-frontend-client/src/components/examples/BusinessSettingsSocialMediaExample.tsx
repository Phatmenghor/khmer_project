import React, { useState } from 'react'
import { useBusinessSettingsCache } from '@/hooks/use-business-settings-cache'
import { SocialMedia } from '@/hooks/use-business-settings'

const DEFAULT_SOCIAL_IMAGE = 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce'

/**
 * Example: Business Settings with Social Media Management
 * Shows how to:
 * - Display social media with fallback images
 * - Handle missing id fields
 * - Add/remove social media items
 * - Support categories and subcategories similarly
 */
export function BusinessSettingsSocialMediaExample() {
  const { settings } = useBusinessSettingsCache({
    businessId: 'your-business-id',
  })

  const [socialMediaList, setSocialMediaList] = useState<SocialMedia[]>(
    settings?.socialMedia || []
  )
  const [newSocial, setNewSocial] = useState({
    name: '',
    linkUrl: '',
    imageUrl: '',
  })

  // Handle adding new social media
  const handleAddSocial = () => {
    if (!newSocial.name || !newSocial.linkUrl) {
      alert('Please fill in name and link')
      return
    }

    const newItem: SocialMedia = {
      id: crypto.randomUUID(),
      name: newSocial.name,
      linkUrl: newSocial.linkUrl,
      imageUrl: newSocial.imageUrl || DEFAULT_SOCIAL_IMAGE,
    }

    setSocialMediaList([...socialMediaList, newItem])
    setNewSocial({ name: '', linkUrl: '', imageUrl: '' })
  }

  // Handle removing social media
  const handleRemoveSocial = (id: string) => {
    setSocialMediaList(socialMediaList.filter((item) => item.id !== id))
  }

  // Handle updating social media item
  const handleUpdateSocial = (id: string, field: string, value: string) => {
    setSocialMediaList(
      socialMediaList.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    )
  }

  return (
    <div className="business-settings-container">
      <h2>{settings?.businessName || 'Business Name'}</h2>

      {/* Display Current Social Media */}
      <section className="social-media-section">
        <h3>Social Media Links</h3>

        {socialMediaList && socialMediaList.length > 0 ? (
          <div className="social-media-list">
            {socialMediaList.map((social) => (
              <div key={social.id || social.name} className="social-media-item">
                {/* Show/hide based on id existence */}
                {social.id ? (
                  <div className="social-item-badge">
                    <span className="has-id">✓ ID: {social.id}</span>
                  </div>
                ) : (
                  <div className="social-item-badge">
                    <span className="no-id">No ID (will be created)</span>
                  </div>
                )}

                {/* Social Media Card */}
                <div className="social-card">
                  {/* Image with fallback */}
                  <img
                    src={social.imageUrl || DEFAULT_SOCIAL_IMAGE}
                    alt={social.name}
                    className="social-icon"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).src = DEFAULT_SOCIAL_IMAGE
                    }}
                  />

                  {/* Info */}
                  <div className="social-info">
                    <h4>{social.name}</h4>
                    <a href={social.linkUrl} target="_blank" rel="noopener noreferrer">
                      {social.linkUrl}
                    </a>
                  </div>

                  {/* Actions (if has id) */}
                  {social.id && (
                    <div className="social-actions">
                      <button
                        onClick={() => handleRemoveSocial(social.id!)}
                        className="btn-remove"
                        title="Remove social media"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-social">No social media links configured</p>
        )}

        {/* Add New Social Media */}
        <div className="add-social-section">
          <h4>Add New Social Media</h4>
          <div className="form-group">
            <input
              type="text"
              placeholder="Platform name (e.g., Facebook, Twitter)"
              value={newSocial.name}
              onChange={(e) => setNewSocial({ ...newSocial, name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <input
              type="url"
              placeholder="Profile URL"
              value={newSocial.linkUrl}
              onChange={(e) => setNewSocial({ ...newSocial, linkUrl: e.target.value })}
            />
          </div>
          <div className="form-group">
            <input
              type="url"
              placeholder="Icon URL (optional - uses default if blank)"
              value={newSocial.imageUrl}
              onChange={(e) => setNewSocial({ ...newSocial, imageUrl: e.target.value })}
            />
          </div>
          <button onClick={handleAddSocial} className="btn-primary">
            Add Social Media
          </button>
        </div>
      </section>

      {/* Render Categories Similarly */}
      <CategoriesExample businessId={settings?.businessId} />

      {/* Render Subcategories Similarly */}
      <SubcategoriesExample businessId={settings?.businessId} />
    </div>
  )
}

/**
 * Example: Categories with Image and ID handling
 */
function CategoriesExample({ businessId }: { businessId?: string }) {
  const [categories, setCategories] = useState<any[]>([
    {
      id: '770e8400-e29b-41d4-a716-446655440001',
      name: 'Electronics',
      imageUrl: 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce',
    },
    {
      id: '770e8400-e29b-41d4-a716-446655440002',
      name: 'Clothing',
      imageUrl: null,
    },
  ])

  const handleRemoveCategory = (id: string) => {
    setCategories(categories.filter((cat) => cat.id !== id))
  }

  return (
    <section className="categories-section">
      <h3>Categories</h3>
      <div className="categories-grid">
        {categories.map((category) => (
          <div key={category.id} className="category-card">
            {/* Show status */}
            {category.id ? (
              <span className="id-badge has-id">✓ ID: {category.id}</span>
            ) : (
              <span className="id-badge no-id">New</span>
            )}

            {/* Image with fallback */}
            <img
              src={category.imageUrl || DEFAULT_SOCIAL_IMAGE}
              alt={category.name}
              className="category-image"
              onError={(e) => {
                ;(e.target as HTMLImageElement).src = DEFAULT_SOCIAL_IMAGE
              }}
            />

            {/* Name */}
            <h4>{category.name}</h4>

            {/* Remove button */}
            {category.id && (
              <button
                onClick={() => handleRemoveCategory(category.id)}
                className="btn-remove"
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

/**
 * Example: Subcategories with Image and ID handling
 */
function SubcategoriesExample({ businessId }: { businessId?: string }) {
  const [subcategories, setSubcategories] = useState<any[]>([
    {
      id: '880e8400-e29b-41d4-a716-446655440001',
      categoryId: '770e8400-e29b-41d4-a716-446655440001',
      name: 'Laptops',
      imageUrl: 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce',
    },
    {
      id: '880e8400-e29b-41d4-a716-446655440002',
      categoryId: '770e8400-e29b-41d4-a716-446655440001',
      name: 'Phones',
      imageUrl: undefined,
    },
  ])

  const handleRemoveSubcategory = (id: string) => {
    setSubcategories(subcategories.filter((sub) => sub.id !== id))
  }

  return (
    <section className="subcategories-section">
      <h3>Subcategories</h3>
      <div className="subcategories-list">
        {subcategories.map((subcategory) => (
          <div key={subcategory.id} className="subcategory-item">
            {/* Status indicator */}
            <div className="status">
              {subcategory.id ? (
                <span className="badge success">✓ Saved (ID: {subcategory.id})</span>
              ) : (
                <span className="badge pending">● Not yet saved</span>
              )}
            </div>

            {/* Item content */}
            <div className="item-content">
              <img
                src={subcategory.imageUrl || DEFAULT_SOCIAL_IMAGE}
                alt={subcategory.name}
                className="subcategory-image"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).src = DEFAULT_SOCIAL_IMAGE
                }}
              />
              <div className="item-info">
                <h5>{subcategory.name}</h5>
                {!subcategory.imageUrl && (
                  <p className="text-muted">Using default image</p>
                )}
              </div>
            </div>

            {/* Action button */}
            {subcategory.id && (
              <button
                onClick={() => handleRemoveSubcategory(subcategory.id)}
                className="btn-icon"
                title="Remove"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

/* ============================================================================
   USAGE EXAMPLES
   ============================================================================

   1. Display with conditional rendering:

   {socialMedia.map((item) => (
     <div key={item.id || item.name}>
       {item.id ? (
         <p>ID: {item.id}</p>
       ) : (
         <p>No ID yet</p>
       )}
       <img src={item.imageUrl || DEFAULT_IMAGE} />
     </div>
   ))}

   2. Add item with auto-generated ID:

   const newItem: SocialMedia = {
     id: crypto.randomUUID(),
     name: 'Facebook',
     imageUrl: imageUrl || DEFAULT_IMAGE,
     linkUrl: 'https://facebook.com/...'
   }

   3. Remove item (only if has id):

   if (item.id) {
     setSocialMediaList(list => list.filter(i => i.id !== item.id))
   }

   4. Update image with fallback:

   <img
     src={item.imageUrl || DEFAULT_IMAGE}
     onError={(e) => e.target.src = DEFAULT_IMAGE}
   />

   5. Apply same pattern to categories:

   categories.map((cat) => (
     <div key={cat.id}>
       {cat.id && <span>✓ Saved</span>}
       <img src={cat.imageUrl || DEFAULT_IMAGE} />
       {cat.id && <button onClick={() => remove(cat.id)}>Delete</button>}
     </div>
   ))

============================================================================ */
