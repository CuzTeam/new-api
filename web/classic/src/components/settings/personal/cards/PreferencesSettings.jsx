/*
Copyright (C) 2025 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/

import React, { useContext, useEffect, useState } from 'react';
import { Card, Select, Typography, Avatar } from '@douyinfe/semi-ui';
import { Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { API, showError, showSuccess } from '../../../../helpers';
import { UserContext } from '../../../../context/User';
import { normalizeLanguage } from '../../../../i18n/language';

const languageOptions = [
  { value: 'zh-CN', label: '简体中文' },
  { value: 'zh-TW', label: '繁體中文' },
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'Français' },
  { value: 'ru', label: 'Русский' },
  { value: 'ja', label: '日本語' },
  { value: 'vi', label: 'Tiếng Việt' },
];

const FRONTEND_THEME_COOKIE_NAME = 'frontend_theme';
const FRONTEND_THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

const frontendThemeOptions = [
  { value: 'default', label: '新版本 UI' },
  { value: 'classic', label: '旧版本 UI' },
];

const getFrontendTheme = () => {
  if (typeof document === 'undefined') return 'default';
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${FRONTEND_THEME_COOKIE_NAME}=`);
  if (parts.length !== 2) return 'default';
  const theme = parts.pop()?.split(';').shift();
  return theme === 'classic' ? 'classic' : 'default';
};

const setFrontendTheme = (theme) => {
  if (typeof document === 'undefined') return;
  document.cookie = `${FRONTEND_THEME_COOKIE_NAME}=${theme}; path=/; max-age=${FRONTEND_THEME_COOKIE_MAX_AGE}`;
};

const getFrontendThemeSettingsPath = (theme) => {
  return theme === 'classic' ? '/console/personal' : '/profile';
};

const updateFrontendThemePreference = async (theme, userId) => {
  const response = await fetch('/api/user/self', {
    method: 'PUT',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'New-API-User': String(userId ?? -1),
    },
    body: JSON.stringify({
      frontend_theme: theme,
    }),
  });

  const data = await response.json();
  if (!response.ok || !data?.success) {
    throw new Error(data?.message || 'save frontend theme failed');
  }
  return data;
};

const PreferencesSettings = ({ t }) => {
  const { i18n } = useTranslation();
  const [userState, userDispatch] = useContext(UserContext);
  const [currentLanguage, setCurrentLanguage] = useState(
    normalizeLanguage(i18n.language) || 'zh-CN',
  );
  const [loading, setLoading] = useState(false);
  const [currentFrontendTheme, setCurrentFrontendTheme] = useState(
    getFrontendTheme(),
  );
  const [themeLoading, setThemeLoading] = useState(false);

  useEffect(() => {
    if (!userState?.user?.setting) return;
    try {
      const settings = JSON.parse(userState.user.setting);
      if (settings.language) {
        const lang = normalizeLanguage(settings.language);
        setCurrentLanguage(lang);
        if (i18n.language !== lang) {
          i18n.changeLanguage(lang);
        }
      }
      if (settings.frontend_theme) {
        setCurrentFrontendTheme(
          settings.frontend_theme === 'classic' ? 'classic' : 'default',
        );
      }
    } catch (e) {}
  }, [userState?.user?.setting, i18n]);

  useEffect(() => {
    setCurrentFrontendTheme(getFrontendTheme());
  }, []);

  const handleLanguagePreferenceChange = async (lang) => {
    if (lang === currentLanguage) return;

    setLoading(true);
    const previousLang = currentLanguage;

    try {
      setCurrentLanguage(lang);
      i18n.changeLanguage(lang);
      localStorage.setItem('i18nextLng', lang);

      const res = await API.put('/api/user/self', {
        language: lang,
      });

      if (res.data.success) {
        showSuccess(t('语言偏好已保存'));
        let settings = {};
        if (userState?.user?.setting) {
          try {
            settings = JSON.parse(userState.user.setting) || {};
          } catch (e) {
            settings = {};
          }
        }
        settings.language = lang;
        const nextUser = {
          ...userState.user,
          setting: JSON.stringify(settings),
        };
        userDispatch({
          type: 'login',
          payload: nextUser,
        });
        localStorage.setItem('user', JSON.stringify(nextUser));
      } else {
        showError(res.data.message || t('保存失败'));
        setCurrentLanguage(previousLang);
        i18n.changeLanguage(previousLang);
        localStorage.setItem('i18nextLng', previousLang);
      }
    } catch (error) {
      showError(t('保存失败，请重试'));
      setCurrentLanguage(previousLang);
      i18n.changeLanguage(previousLang);
      localStorage.setItem('i18nextLng', previousLang);
    } finally {
      setLoading(false);
    }
  };

  const handleFrontendThemeChange = async (theme) => {
    if (theme === currentFrontendTheme) return;
    setThemeLoading(true);
    const previousTheme = currentFrontendTheme;

    try {
      await updateFrontendThemePreference(theme, userState?.user?.id);

      let settings = {};
      if (userState?.user?.setting) {
        try {
          settings = JSON.parse(userState.user.setting) || {};
        } catch (e) {
          settings = {};
        }
      }
      settings.frontend_theme = theme;
      const nextUser = {
        ...userState.user,
        setting: JSON.stringify(settings),
      };
      userDispatch({
        type: 'login',
        payload: nextUser,
      });
      localStorage.setItem('user', JSON.stringify(nextUser));

      setFrontendTheme(theme);
      setCurrentFrontendTheme(theme);
      showSuccess(t('界面风格已切换，正在跳转'));
      setTimeout(() => {
        window.location.assign(getFrontendThemeSettingsPath(theme));
      }, 300);
    } catch (error) {
      setCurrentFrontendTheme(previousTheme);
      showError(error.message || t('界面风格切换失败'));
    } finally {
      setThemeLoading(false);
    }
  };

  return (
    <Card className='!rounded-2xl shadow-sm border-0'>
      <div className='flex items-center mb-4'>
        <Avatar size='small' color='violet' className='mr-3 shadow-md'>
          <Languages size={16} />
        </Avatar>
        <div>
          <Typography.Text className='text-lg font-medium'>
            {t('偏好设置')}
          </Typography.Text>
          <div className='text-xs text-gray-600 dark:text-gray-400'>
            {t('界面语言和其他个人偏好')}
          </div>
        </div>
      </div>

      <Card className='!rounded-xl border dark:border-gray-700'>
        <div className='flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4'>
          <div className='flex items-start w-full sm:w-auto'>
            <div className='w-12 h-12 rounded-full bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center mr-4 flex-shrink-0'>
              <Languages
                size={20}
                className='text-violet-600 dark:text-violet-400'
              />
            </div>
            <div>
              <Typography.Title heading={6} className='mb-1'>
                {t('语言偏好')}
              </Typography.Title>
              <Typography.Text type='tertiary' className='text-sm'>
                {t('选择您的首选界面语言，设置将自动保存并同步到所有设备')}
              </Typography.Text>
            </div>
          </div>
          <Select
            value={currentLanguage}
            onChange={handleLanguagePreferenceChange}
            style={{ width: 180 }}
            loading={loading}
            optionList={languageOptions.map((opt) => ({
              value: opt.value,
              label: opt.label,
            }))}
          />
        </div>
      </Card>

      <Card className='!rounded-xl border dark:border-gray-700 mt-4'>
        <div className='flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4'>
          <div className='flex items-start w-full sm:w-auto'>
            <div className='w-12 h-12 rounded-full bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center mr-4 flex-shrink-0'>
              <Languages
                size={20}
                className='text-violet-600 dark:text-violet-400'
              />
            </div>
            <div>
              <Typography.Title heading={6} className='mb-1'>
                {t('界面风格')}
              </Typography.Title>
              <Typography.Text type='tertiary' className='text-sm'>
                {t('可在新版本 UI 和旧版本 UI 之间切换，保存后页面会立即跳转')}
              </Typography.Text>
            </div>
          </div>
          <Select
            value={currentFrontendTheme}
            onChange={handleFrontendThemeChange}
            style={{ width: 180 }}
            loading={themeLoading}
            optionList={frontendThemeOptions.map((opt) => ({
              value: opt.value,
              label: t(opt.label),
            }))}
          />
        </div>
      </Card>

      <div className='mt-4 text-xs text-gray-500 dark:text-gray-400'>
        <Typography.Text type='tertiary'>
          {t('提示：语言偏好会同步到您登录的所有设备，并影响 API 返回的错误消息语言。')}
        </Typography.Text>
      </div>
    </Card>
  );
};

export default PreferencesSettings;
