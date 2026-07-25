import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { usePosts } from '../../hooks/usePosts';
import { fileToBase64 } from '../../utils/helpers';
import AIPostAssistant from '../../components/ai/AIPostAssistant';

export default function CreatePost() {
  const { createPost } = usePosts();
  const navigate = useNavigate();
  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { visibility: 'public' },
  });

  const description = watch('description') || '';
  const visibility = watch('visibility');
  const charLimit = 500;
  const charColor =
    description.length > charLimit ? 'text-red-500' : description.length > charLimit - 50 ? 'text-orange-500' : 'text-gray-400';

  async function processFile(file) {
    if (!file || !file.type.startsWith('image/')) return;
    const base64 = await fileToBase64(file);
    setImageBase64(base64);
    setImagePreview(base64);
  }

  async function handleImageChange(e) {
    await processFile(e.target.files[0]);
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    processFile(e.dataTransfer.files[0]);
  }

  function clearImage() {
    setImageBase64(null);
    setImagePreview(null);
  }

  function onSaveDraft(data) {
    createPost({
      description: data.description,
      image: imageBase64,
      isPublic: data.visibility === 'public',
      isDraft: true,
    });
    setSuccessMessage('Post saved as draft');
    reset();
    clearImage();
    setTimeout(() => setSuccessMessage(''), 3000);
  }

  function onPublish(data) {
    createPost({
      description: data.description,
      image: imageBase64,
      isPublic: data.visibility === 'public',
      isDraft: false,
    });
    navigate('/');
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-medium text-ink">Create a Post</h1>
        <p className="text-sm text-gray-500 mt-1">Share something with your network.</p>
      </div>

      {successMessage && (
        <div className="flex items-center gap-2 bg-violet-50 text-violet-700 px-4 py-3 rounded-xl mb-6 text-sm font-medium">
          <span>✓</span> {successMessage}
        </div>
      )}

      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <form className="flex flex-col gap-6">
          <AIPostAssistant onUseContent={(text) => setValue('description', text, { shouldValidate: true })} />

          {/* Description */}
          <div>
            <label className="text-sm font-semibold text-ink block mb-2">
              What's on your mind?
            </label>
            <textarea
              rows={5}
              placeholder="Share your thoughts, updates, or ideas..."
              maxLength={charLimit}
              className={`w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-violet-400 transition-all resize-none ${
                errors.description ? 'border-red-400' : 'border-gray-200'
              }`}
              {...register('description', {
                required: 'Description is required',
                minLength: { value: 10, message: 'Description must be at least 10 characters' },
              })}
            />
            <div className="flex justify-between mt-1.5">
              {errors.description ? (
                <span className="text-xs text-red-500">{errors.description.message}</span>
              ) : (
                <span className="text-xs text-gray-400">Minimum 10 characters</span>
              )}
              <span className={`text-xs font-medium ${charColor}`}>
                {description.length} / {charLimit}
              </span>
            </div>
          </div>

          {/* Image upload */}
          <div>
            <label className="text-sm font-semibold text-ink block mb-2">Photo</label>

            {!imagePreview ? (
              <label
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl py-10 cursor-pointer transition-colors ${
                  isDragging ? 'border-violet-400 bg-violet-50' : 'border-gray-200 hover:border-violet-300 hover:bg-gray-50'
                }`}
              >
                <span className="text-3xl">🖼️</span>
                <p className="text-sm text-gray-500">
                  <span className="text-violet-600 font-medium">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            ) : (
              <div className="relative">
                <img src={imagePreview} alt="Preview" className="w-full max-h-80 object-cover rounded-xl" />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Visibility — card-style selector */}
          <div>
            <label className="text-sm font-semibold text-ink block mb-2">Who can see this?</label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`flex items-center gap-3 border-2 rounded-xl px-4 py-3 cursor-pointer transition-all ${
                  visibility === 'public' ? 'border-violet-400 bg-violet-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input type="radio" value="public" {...register('visibility')} className="hidden" />
                <span className="text-xl">🌍</span>
                <div>
                  <p className="text-sm font-medium text-ink">Public</p>
                  <p className="text-xs text-gray-500">Anyone can see this</p>
                </div>
              </label>

              <label
                className={`flex items-center gap-3 border-2 rounded-xl px-4 py-3 cursor-pointer transition-all ${
                  visibility === 'private' ? 'border-violet-400 bg-violet-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input type="radio" value="private" {...register('visibility')} className="hidden" />
                <span className="text-xl">🔒</span>
                <div>
                  <p className="text-sm font-medium text-ink">Private</p>
                  <p className="text-xs text-gray-500">Only you can see this</p>
                </div>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit(onSaveDraft)}
              className="flex-1 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors px-5 py-3 rounded-xl disabled:opacity-50"
            >
              Save as Draft
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit(onPublish)}
              className="flex-1 text-sm font-medium text-white bg-violet-500 hover:bg-violet-600 transition-colors px-5 py-3 rounded-xl shadow-sm shadow-violet-500/30 disabled:opacity-50"
            >
              Publish
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}