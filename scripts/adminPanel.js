// ============================================
// АДМИН-ПАНЕЛЬ etogamezzz v6 FINAL
// Логика — в воркере, DOM — в main.js
// ============================================
{

function log(msg) {
	console.log('%c[etogamezzz]%c ' + msg, 'color:#ff4444;font-weight:bold;', 'color:#ccc;');
}

log('Загружаюсь в воркере...');

// Ждём появления runtime и отправляем сообщение в главный поток
function tryHookRuntime(tries = 0) {
	// Пробуем найти runtime через self
	if (self.runtime) {
		log('Runtime найден через self.runtime');
		setupCommands(self.runtime);
		return;
	}
	
	// Пробуем через IRuntime
	if (self.IRuntime && self.IRuntime.prototype && self.IRuntime.prototype._runtime) {
		log('Runtime найден через IRuntime');
		setupCommands(self.IRuntime.prototype._runtime);
		return;
	}
	
	if (tries < 100) {
		setTimeout(() => tryHookRuntime(tries + 1), 100);
	} else {
		log('Не удалось найти runtime. Команды будут доступны через консоль.');
		log('Напиши: __EGZ__.hook(runtime) когда получишь рантайм');
		
		// Даже без рантайма — отправляем готовность в main.js
		postReadyToMain();
	}
}

function setupCommands(rt) {
	log('✅ Админка подключена к рантайму!');
	
	const cmd = {
		addMoney(amount) {
			try {
				const gv = rt.GetEventSheetManager().GetGlobalVars();
				const keys = [];
				gv.forEach((v, k) => keys.push(k));
				
				let found = false;
				for (const key of keys) {
					const lower = key.toLowerCase();
					if (lower.includes('деньг') || lower.includes('money') || lower.includes('coin') || lower.includes('рубл') || lower.includes('монет')) {
						gv.set(key, Number(gv.get(key)) + amount);
						log('+' + amount + ' (переменная: ' + key + ' = ' + gv.get(key) + ')');
						found = true;
						break;
					}
				}
				if (!found) {
					log('Переменные: ' + keys.join(', '));
					log('Не найдена переменная денег. Попробуй вручную: __EGZ__.setVar("имя", значение)');
				}
			} catch(e) {
				log('Ошибка addMoney: ' + e.message);
			}
		},
		
		spawn(name) {
			try {
				const layout = rt.GetCurrentLayout();
				if (!layout) { log('Нет лэйаута'); return; }
				let px = 400, py = 300;
				try {
					const player = layout.GetFirstInstanceByType('игрок');
					if (player) { px = player.GetX(); py = player.GetY(); }
				} catch(e) {}
				layout.CreateObject(name, px, py + 60);
				log('Создано: ' + name);
			} catch(e) {
				log('Ошибка spawn: ' + e.message);
			}
		},
		
		killAll() {
			const mobs = ['зондбе', 'зондбе2', 'зондбе3', 'зондбе4', 'Гоблинооо', 'скелетик'];
			let killed = 0;
			try {
				const layout = rt.GetCurrentLayout();
				if (!layout) { log('Нет лэйаута'); return; }
				mobs.forEach(name => {
					try {
						const instances = layout.GetInstancesByType(name);
						if (instances) for (const inst of instances) {
							rt.DestroyInstance(inst);
							killed++;
						}
					} catch(e) {}
				});
				log('Убито мобов: ' + killed);
			} catch(e) {
				log('Ошибка killAll: ' + e.message);
			}
		},
		
		tip() {
			const tips = [
				"На самом деле, etogamezzz — обычный смертный.",
				"Твой IP уже у нас в базах :3",
				"Если игра вылетела — это фича, а не баг.",
				"Джефф не всегда был добрым. Спроси про 1987.",
				"Все монстры хотят обниматься.",
				"Мультиплеер работает на магии и паре строк кода."
			];
			log(tips[Math.floor(Math.random() * tips.length)]);
		},
		
		list() {
			try {
				const layout = rt.GetCurrentLayout();
				if (!layout) { log('Нет лэйаута'); return; }
				log('Объекты на сцене: используй __EGZ__.listAll()');
			} catch(e) {}
		},
		
		vars() {
			try {
				const gv = rt.GetEventSheetManager().GetGlobalVars();
				const vars = [];
				gv.forEach((v, k) => vars.push(k + ' = ' + v));
				log('Глобальные переменные: ' + (vars.length ? vars.join(', ') : 'пусто'));
			} catch(e) {
				log('Ошибка vars: ' + e.message);
			}
		},
		
		setVar(name, value) {
			try {
				const gv = rt.GetEventSheetManager().GetGlobalVars();
				if (gv.has(name)) {
					gv.set(name, value);
					log(name + ' = ' + value);
				} else {
					log('Переменная ' + name + ' не найдена');
				}
			} catch(e) {
				log('Ошибка: ' + e.message);
			}
		},
		
		hook(rt2) {
			log('Ручное подключение рантайма...');
			setupCommands(rt2);
		}
	};
	
	self.__EGZ__ = cmd;
	postReadyToMain();
}

function postReadyToMain() {
	// Отправляем сообщение в главный поток (main.js)
	try {
		self.postMessage({ type: 'etogamezzz-ready' });
	} catch(e) {
		// Не в воркере — ничего страшного
	}
	log('Команды: __EGZ__.addMoney(500) | __EGZ__.spawn("топор") | __EGZ__.vars() | __EGZ__.killAll()');
}

// Запускаем поиск рантайма
tryHookRuntime();

} // end block