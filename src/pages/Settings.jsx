import { useState, useEffect } from 'react';
import { useAuth } from '../state/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiUser, FiLock, FiBell, FiImage, FiDollarSign, FiInfo, FiLogOut, FiCheckCircle, FiEye, FiEyeOff } from 'react-icons/fi';
import api from '../utils/api';

export default function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('account');
  const [notifications, setNotifications] = useState([]);
  const [notificationPrefs, setNotificationPrefs] = useState({
    email_notifications: true,
    push_notifications: false,
    product_updates: true,
    marketing_emails: false,
    security_alerts: true
  });
  const [loading, setLoading] = useState(false);
  
  // États pour le changement de mot de passe
  const [passwordForm, setPasswordForm] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Charger les données lorsque l'onglet change
  useEffect(() => {
    if (activeTab === 'notifications') {
      fetchNotifications();
      fetchNotificationPreferences();
    }
  }, [activeTab]);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('notifications/');
      setNotifications(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
    }
  };

  const fetchNotificationPreferences = async () => {
    try {
      const response = await api.get('notification-preferences/');
      setNotificationPrefs(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des préférences:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.patch(`notifications/${notificationId}/read/`);
      setNotifications(notifications.map(notif => 
        notif.id === notificationId ? { ...notif, is_read: true } : notif
      ));
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post('notifications/mark-all-read/');
      setNotifications(notifications.map(notif => ({ ...notif, is_read: true })));
    } catch (error) {
      console.error('Erreur lors du marquage de toutes les notifications:', error);
    }
  };

  const updateNotificationPreference = async (key, value) => {
    try {
      setLoading(true);
      const updatedPrefs = { ...notificationPrefs, [key]: value };
      setNotificationPrefs(updatedPrefs);
      await api.put('notification-preferences/', updatedPrefs);
    } catch (error) {
      console.error('Erreur lors de la mise à jour des préférences:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour gérer le changement de mot de passe
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordMessage('');

    // Validation
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordError('Les nouveaux mots de passe ne correspondent pas');
      return;
    }

    if (passwordForm.new_password.length < 6) {
      setPasswordError('Le nouveau mot de passe doit contenir au moins 6 caractères');
      return;
    }

    try {
      const response = await api.post('/auth/change-password/', passwordForm);
      
      setPasswordMessage('✅ Mot de passe modifié avec succès !');
      setPasswordForm({ old_password: '', new_password: '', confirm_password: '' });
    } catch (error) {
      console.error('Erreur changement mot de passe:', error);
      setPasswordError(
        error.response?.data?.detail || 
        error.response?.data?.old_password?.[0] || 
        'Erreur lors du changement de mot de passe'
      );
    }
  };

  const handlePasswordInputChange = (e) => {
    setPasswordForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div className="mb-4 sm:mb-0">
            <button
              onClick={() => navigate(-1)}
              className="text-primary-600 hover:text-primary-700 flex items-center gap-2 mb-4 transition-colors"
            >
              <FiArrowLeft className="mr-1" /> Retour
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
            <p className="text-gray-600 mt-2">Gérez vos préférences et paramètres de compte</p>
          </div>
          <div className="bg-primary-50 p-4 rounded-xl">
            <p className="text-sm text-primary-700">
              Connecté en tant que <strong>{user?.email}</strong>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-medium p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Navigation</h2>
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('account')}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-colors flex items-center ${
                    activeTab === 'account'
                      ? 'bg-primary-100 text-primary-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <FiUser className="mr-3" /> Compte
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-colors flex items-center ${
                    activeTab === 'security'
                      ? 'bg-primary-100 text-primary-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <FiLock className="mr-3" /> Sécurité
                </button>
                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-colors flex items-center ${
                    activeTab === 'notifications'
                      ? 'bg-primary-100 text-primary-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <FiBell className="mr-3" /> Notifications
                </button>
                <button
                  onClick={() => setActiveTab('appearance')}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-colors flex items-center ${
                    activeTab === 'appearance'
                      ? 'bg-primary-100 text-primary-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <FiImage className="mr-3" /> Apparence
                </button>
                <button
                  onClick={() => setActiveTab('billing')}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-colors flex items-center ${
                    activeTab === 'billing'
                      ? 'bg-primary-100 text-primary-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <FiDollarSign className="mr-3" /> Facturation
                </button>
              </nav>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <Link
                  to="/help"
                  className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <FiInfo className="mr-3" /> Centre d'aide
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left flex items-center px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors mt-2"
                >
                  <FiLogOut className="mr-3" /> Déconnexion
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Section Compte */}
            {activeTab === 'account' && (
              <div className="bg-white rounded-2xl shadow-medium p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Informations du compte</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nom complet</label>
                    <div className="text-gray-900 font-medium">{user?.full_name || 'Non renseigné'}</div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <div className="text-gray-900 font-medium">{user?.email}</div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                    <div className="text-gray-900 font-medium">{user?.phone || 'Non renseigné'}</div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Entreprise</label>
                    <div className="text-gray-900 font-medium">{user?.company_name || 'Non renseigné'}</div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to="/profile"
                    className="inline-flex items-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors"
                  >
                    <FiUser className="mr-2" /> Modifier le profil
                  </Link>
                  
                  <button className="inline-flex items-center px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors">
                    Exporter mes données
                  </button>
                </div>

               
              </div>
            )}

            {/* Section Sécurité */}
            {activeTab === 'security' && (
              <div className="bg-white rounded-2xl shadow-medium p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Sécurité du compte</h2>
                
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Changer le mot de passe</h3>
                  
                  {passwordMessage && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
                      <div className="flex items-center">
                        <span className="text-lg mr-2">✅</span>
                        <span>{passwordMessage}</span>
                      </div>
                    </div>
                  )}

                  {passwordError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                      <div className="flex items-center">
                        <span className="text-lg mr-2">❌</span>
                        <span>{passwordError}</span>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mot de passe actuel *
                      </label>
                      <div className="relative">
                        <input
                          type={showOldPassword ? "text" : "password"}
                          name="old_password"
                          value={passwordForm.old_password}
                          onChange={handlePasswordInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-10"
                          placeholder="Votre mot de passe actuel"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowOldPassword(!showOldPassword)}
                        >
                          {showOldPassword ? <FiEyeOff className="text-gray-400" /> : <FiEye className="text-gray-400" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nouveau mot de passe *
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          name="new_password"
                          value={passwordForm.new_password}
                          onChange={handlePasswordInputChange}
                          required
                          minLength={6}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-10"
                          placeholder="Au moins 6 caractères"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? <FiEyeOff className="text-gray-400" /> : <FiEye className="text-gray-400" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirmer le nouveau mot de passe *
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirm_password"
                          value={passwordForm.confirm_password}
                          onChange={handlePasswordInputChange}
                          required
                          minLength={6}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-10"
                          placeholder="Confirmez votre nouveau mot de passe"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <FiEyeOff className="text-gray-400" /> : <FiEye className="text-gray-400" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 px-6 rounded-xl font-semibold transition-colors duration-200"
                    >
                      🔒 Modifier le mot de passe
                    </button>
                  </form>

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Conseils de sécurité</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Utilisez au moins 6 caractères</li>
                      <li>• Combinez lettres, chiffres et caractères spéciaux</li>
                      <li>• Évitez les mots de passe courants</li>
                    </ul>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Sécurité avancée</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-6 rounded-xl">
                      <h4 className="font-medium text-gray-900 mb-2">Authentification à deux facteurs</h4>
                      <p className="text-sm text-gray-600 mb-4">Ajoutez une couche de sécurité supplémentaire à votre compte</p>
                      <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors">
                        Activer la 2FA
                      </button>
                    </div>
                    
                    <div className="bg-gray-50 p-6 rounded-xl">
                      <h4 className="font-medium text-gray-900 mb-2">Sessions actives</h4>
                      <p className="text-sm text-gray-600 mb-4">Gérez vos appareils connectés et sessions actives</p>
                      <button className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-colors">
                        Voir les sessions
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Section Notifications */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                {/* ... (le code existant pour les notifications) ... */}
              </div>
            )}

            {/* Sections pour apparence et facturation */}
            {activeTab === 'appearance' && (
              <div className="bg-white rounded-2xl shadow-medium p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Apparence</h2>
                <p className="text-gray-600">Cette section sera bientôt disponible.</p>
              </div>
            )}

            {activeTab === 'billing' && (
              <div className="bg-white rounded-2xl shadow-medium p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Facturation</h2>
                <p className="text-gray-600">Cette section sera bientôt disponible.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}