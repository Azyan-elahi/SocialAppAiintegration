import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { fileToBase64 } from '../../utils/helpers';
import Avatar from '../../components/ui/Avatar';
import AIProfileOptimize from '../../components/ai/AIProfileOptimize';

export default function ProfileSettings() {
  const { currentUser, updateCurrentUser } = useAuth();
  const [avatarPreview, setAvatarPreview] = useState(currentUser.avatar);
  const [successMessage, setSuccessMessage] = useState('');
  const [aiBioSuggestion, setAiBioSuggestion] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: currentUser.name,
      bio: currentUser.bio || '',
      location: currentUser.location || '',
    },
  });

  const bio = watch('bio') || '';
  const bioLimit = 150;
  const bioColor =
    bio.length > bioLimit ? 'text-red-500' : bio.length > bioLimit - 30 ? 'text-orange-500' : 'text-gray-400';

  async function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const base64 = await fileToBase64(file);
    setAvatarPreview(base64);
  }

  function onSubmit(data) {
    updateCurrentUser({
      name: data.name,
      bio: data.bio,
      location: data.location,
      avatar: avatarPreview,
    });
    setSuccessMessage('Profile updated successfully');
    setTimeout(() => setSuccessMessage(''), 3000);
  }

  return (
    <div className="max-w-xl">
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-medium text-ink">Profile Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Update your personal information.</p>
      </div>

      {successMessage && (
        <div className="flex items-center gap-2 bg-violet-50 text-violet-700 px-4 py-3 rounded-xl mb-6 text-sm font-medium">
          <span>✓</span> {successMessage}
        </div>
      )}

      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          {/* Avatar */}
          <div>
            <label className="text-sm font-semibold text-ink block mb-3">Profile Photo</label>
            <div className="flex items-center gap-5">
              <Avatar src={avatarPreview} name={currentUser.name} size="lg" />
              <label className="cursor-pointer">
                <span className="inline-block text-sm font-medium text-violet-600 border border-violet-300 hover:bg-violet-50 transition-colors px-4 py-2 rounded-full">
                  Change Photo
                </span>
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </label>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="text-sm font-semibold text-ink block mb-2">Full Name</label>
            <input
              type="text"
              className={`w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-violet-400 transition-all ${
                errors.name ? 'border-red-400' : 'border-gray-200'
              }`}
              {...register('name', {
                required: 'Full name is required',
                minLength: { value: 2, message: 'Name must be at least 2 characters' },
              })}
            />
            {errors.name && <span className="text-xs text-red-500 mt-1.5 block">{errors.name.message}</span>}
          </div>

          {/* Bio */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-ink">Bio</label>
              <AIProfileOptimize
                name={watch('name')}
                bio={bio}
                location={watch('location')}
                onSuggestion={setAiBioSuggestion}
              />
            </div>
            <textarea
              rows={3}
              maxLength={bioLimit}
              placeholder="Tell people about yourself..."
              className={`w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-violet-400 transition-all resize-none ${
                errors.bio ? 'border-red-400' : 'border-gray-200'
              }`}
              {...register('bio', {
                maxLength: { value: bioLimit, message: `Bio cannot exceed ${bioLimit} characters` },
              })}
            />
            <div className="flex justify-between mt-1.5">
              {errors.bio ? (
                <span className="text-xs text-red-500">{errors.bio.message}</span>
              ) : (
                <span className="text-xs text-gray-400">Optional</span>
              )}
              <span className={`text-xs font-medium ${bioColor}`}>
                {bio.length} / {bioLimit}
              </span>
            </div>

            {aiBioSuggestion && (
              <div className="mt-2 bg-violet-50 border border-violet-200 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1.5">Suggested bio:</p>
                <p className="text-sm text-gray-700 mb-3">{aiBioSuggestion}</p>
                <button
                  type="button"
                  onClick={() => {
                    setValue('bio', aiBioSuggestion, { shouldValidate: true });
                    setAiBioSuggestion('');
                  }}
                  className="text-sm font-medium text-violet-600 border border-violet-300 hover:bg-violet-50 transition-colors px-4 py-1.5 rounded-full"
                >
                  Use Suggestion
                </button>
              </div>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="text-sm font-semibold text-ink block mb-2">Location</label>
            <input
              type="text"
              placeholder="City, Country"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-400 transition-all"
              {...register('location')}
            />
          </div>

          {/* Submit */}
          <div className="pt-2 border-t border-gray-100">
            <button
              type="submit"
              disabled={isSubmitting}
              className="text-sm font-medium text-white bg-violet-500 hover:bg-violet-600 transition-colors px-6 py-3 rounded-xl shadow-sm shadow-violet-500/30 disabled:opacity-50"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}